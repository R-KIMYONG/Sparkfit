// IP 기반 대략 위치 (허락 불필요·거의 실패 없음, 정확도는 동/구 단위 수 km 오차)
// GPS/Wi-Fi 측위가 완전히 실패했을 때만 쓰는 최후의 폴백
const getIpLocation = async () => {
  const res = await fetch('https://ipwho.is/');
  const data = await res.json();
  if (data && data.success && data.latitude && data.longitude) {
    return { lat: data.latitude, long: data.longitude };
  }
  throw new Error('IP 위치 응답 형식 오류');
};

/**
 * Apple 지도처럼 watchPosition으로 CoreLocation을 끈질기게 시도해
 * 정확한 Wi-Fi/GPS 위치를 잡고, 안 되면 IP 위치로 폴백한다.
 *
 * - getCurrentPosition(한 방)과 달리 watchPosition은 연속 요청이라,
 *   locationd가 순간적으로 kCLErrorLocationUnknown을 내도 포기하지 않고
 *   Wi-Fi 재스캔이 성공할 때까지 기다린다. (= Apple 지도가 정확한 이유)
 * - desiredAccuracy 이내의 위치가 들어오면 즉시 확정하고 watch를 종료한다.
 * - timeoutMs 안에 정확한 위치를 못 잡으면 그때까지 받은 best 위치를,
 *   그마저 없으면 IP 위치를 사용한다.
 *
 * @param {object}   opts
 * @param {(loc:{lat:number,long:number}) => void} opts.onLocated 위치 확정 시
 * @param {() => void} [opts.onError]  모든 방법 실패 시
 * @param {number} [opts.timeoutMs=10000]      전체 대기 한도(ms)
 * @param {number} [opts.desiredAccuracy=100]  이 값(m) 이내면 즉시 확정
 * @returns {() => void} 진행 중인 위치 추적을 취소하는 cleanup 함수
 */
export const getBestLocation = ({ onLocated, onError, timeoutMs = 10000, desiredAccuracy = 100 }) => {
  let settled = false;
  let watchId = null;
  let timer = null;
  let best = null;

  const stop = () => {
    if (watchId !== null && navigator.geolocation) navigator.geolocation.clearWatch(watchId);
    if (timer !== null) clearTimeout(timer);
    watchId = null;
    timer = null;
  };

  const fallbackToIp = async () => {
    try {
      onLocated(await getIpLocation());
    } catch {
      onError?.();
    }
  };

  const finish = (coords) => {
    if (settled) return;
    settled = true;
    stop();
    onLocated({ lat: coords.latitude, long: coords.longitude });
  };

  const giveUp = () => {
    if (settled) return;
    settled = true;
    stop();
    // 정확도는 낮아도 잡힌 위치가 있으면 그걸 쓰고, 아무것도 없으면 IP로
    if (best) onLocated({ lat: best.latitude, long: best.longitude });
    else fallbackToIp();
  };

  const bailToIp = () => {
    if (settled) return;
    settled = true;
    stop();
    fallbackToIp();
  };

  if (!navigator.geolocation) {
    fallbackToIp();
    return () => {};
  }

  timer = setTimeout(giveUp, timeoutMs);

  watchId = navigator.geolocation.watchPosition(
    (pos) => {
      best = pos.coords;
      // 충분히 정확하면 즉시 확정, 아니면 계속 지켜보며 정확도 개선을 기다린다
      if (pos.coords.accuracy != null && pos.coords.accuracy <= desiredAccuracy) {
        finish(pos.coords);
      }
    },
    (err) => {
      // 위치를 못 잡는 순간의 에러(kCLErrorLocationUnknown 등)는 무시하고 계속 대기.
      // 단, 권한 거부는 재시도가 무의미하므로 즉시 IP로 폴백한다.
      if (err.code === err.PERMISSION_DENIED) bailToIp();
    },
    { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 60000 }
  );

  // 컴포넌트 언마운트 등으로 취소가 필요할 때 사용
  return () => {
    if (settled) return;
    settled = true;
    stop();
  };
};
