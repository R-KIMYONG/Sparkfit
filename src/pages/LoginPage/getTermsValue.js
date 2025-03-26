export const getTermsValue = (name) => {
  switch (name) {
    case 'termsOfService':
      return `
          <h1>SparkFit 서비스 이용약관</h1>

    <div class="section">
        <h2>여러분을 환영합니다.</h2>
        <p>SparkFit 서비스 및 제품(이하 ‘서비스’)을 이용해 주셔서 감사합니다. 본 약관은 다양한 SparkFit 서비스의 이용과 관련하여 SparkFit 서비스를 제공하는 SparkFit 주식회사(이하 ‘SparkFit’)와 이를 이용하는 SparkFit 서비스 회원(이하 ‘회원’) 또는 비회원과의 관계를 설명하며, 아울러 여러분의 SparkFit 서비스 이용에 도움이 될 수 있는 유익한 정보를 포함하고 있습니다.</p>
        <p>SparkFit 서비스를 이용하시거나 SparkFit 서비스 회원으로 가입하실 경우 여러분은 본 약관 및 관련 운영 정책을 확인하거나 동의하게 되므로, 잠시 시간을 내시어 주의 깊게 살펴봐 주시기 바랍니다.</p>
    </div>

    <div class="section">
        <h2>다양한 SparkFit 서비스를 즐겨보세요.</h2>
        <p>SparkFit는 sparkfit.vercel.app을 비롯한 SparkFit 도메인의 웹사이트 및 응용프로그램(어플리케이션, 앱)을 통해 정보 검색, 다른 이용자와의 커뮤니케이션, 콘텐츠 제공, 상품 쇼핑 등 여러분의 생활에 편리함을 더할 수 있는 다양한 서비스를 제공하고 있습니다. 여러분은 PC, 휴대폰 등 인터넷 이용이 가능한 각종 단말기를 통해 각양각색의 SparkFit 서비스를 자유롭게 이용하실 수 있으며, 개별 서비스들의 구체적인 내용은 각 서비스 상의 안내, 공지사항, SparkFit 웹고객센터(이하 ‘고객센터’) 도움말 등에서 쉽게 확인하실 수 있습니다.</p>
        <p>SparkFit는 기본적으로 여러분 모두에게 동일한 내용의 서비스를 제공합니다. 다만, '청소년보호법' 등 관련 법령이나 기타 개별 서비스 제공에서의 특별한 필요에 의해서 연령 또는 일정한 등급을 기준으로 이용자를 구분하여 제공하는 서비스의 내용, 이용 시간, 이용 횟수 등을 다르게 하는 등 일부 이용을 제한하는 경우가 있습니다. 자세한 내용은 역시 각 서비스 상의 안내, 공지사항, 고객센터 도움말 등에서 확인하실 수 있습니다.</p>
    </div>

    <div class="section">
        <h2>회원으로 가입하시면 SparkFit 서비스를 보다 편리하게 이용할 수 있습니다.</h2>
        <p>여러분은 본 약관을 읽고 동의하신 후 회원 가입을 신청하실 수 있으며, SparkFit는 이에 대한 승낙을 통해 회원 가입 절차를 완료하고 여러분께 SparkFit 서비스 이용 계정(이하 ‘계정’)을 부여합니다. 계정이란 회원이 SparkFit 서비스에 로그인한 이후 이용하는 각종 서비스 이용 이력을 회원 별로 관리하기 위해 설정한 회원 식별 단위를 말합니다. 회원은 자신의 계정을 통해 좀더 다양한 SparkFit 서비스를 보다 편리하게 이용할 수 있습니다. 이와 관련한 상세한 내용은 계정 운영정책 및 고객센터 내 SparkFit 회원가입 방법 등에서 확인해 주세요.</p>
    </div>

    <div class="section">
        <h2>여러분이 제공한 콘텐츠를 소중히 다룰 것입니다.</h2>
        <p>SparkFit는 여러분이 게재한 게시물이 SparkFit 서비스를 통해 다른 이용자들에게 전달되어 우리 모두의 삶을 더욱 풍요롭게 해줄 것을 기대합니다. 게시물은 여러분이 타인 또는 자신이 보게 할 목적으로 SparkFit 서비스 상에 게재한 부호, 문자, 음성, 음향, 그림, 사진, 동영상, 링크 등으로 구성된 각종 콘텐츠 자체 또는 파일을 말합니다.</p>
        <p>SparkFit는 여러분의 생각과 감정이 표현된 콘텐츠를 소중히 보호할 것을 약속 드립니다. 여러분이 제작하여 게재한 게시물에 대한 지식재산권 등의 권리는 당연히 여러분에게 있습니다.</p>
    </div>

    <div class="section">
        <h2>여러분의 개인정보를 소중히 보호합니다.</h2>
        <p>SparkFit는 서비스의 원활한 제공을 위하여 회원이 동의한 목적과 범위 내에서만 개인정보를 수집∙이용하며, 개인정보 보호 관련 법령에 따라 안전하게 관리합니다. SparkFit가 이용자 및 회원에 대해 관련 개인정보를 안전하게 처리하기 위하여 기울이는 노력이나 기타 상세한 사항은 개인정보 처리방침에서 확인하실 수 있습니다.</p>
    </div>

    <div class="section">
        <h2>타인의 권리를 존중해 주세요.</h2>
        <p>여러분이 무심코 게재한 게시물로 인해 타인의 저작권이 침해되거나 명예훼손 등 권리 침해가 발생할 수 있습니다. SparkFit는 이에 대한 문제 해결을 위해 ‘정보통신망 이용촉진 및 정보보호 등에 관한 법률’ 및 ‘저작권법’ 등을 근거로 권리침해 주장자의 요청에 따른 게시물 게시중단, 원 게시자의 이의신청에 따른 해당 게시물 게시 재개 등을 내용으로 하는 게시중단요청서비스를 운영하고 있습니다. 보다 상세한 내용 및 절차는 고객센터 내 게시중단요청서비스 소개를 참고해 주세요.</p>
    </div>

    <div class="section">
        <h2>SparkFit에서 제공하는 다양한 포인트를 요긴하게 활용해 보세요.</h2>
        <p>SparkFit는 여러분이 SparkFit 서비스를 효율적으로 이용할 수 있도록 포인트를 부여하고 있습니다. 포인트는 여러분의 일정한 SparkFit 서비스 이용과 연동하여 SparkFit가 임의로 책정하거나 조정하여 지급하는 일정한 계산 단위를 갖는 서비스 상의 가상 데이터를 말합니다. 포인트는 재산적 가치가 없기 때문에 금전으로 환불 또는 전환할 수 없지만, 포인트의 많고 적음에 따라 여러분의 SparkFit 서비스 이용에 영향을 주는 경우가 있으므로 경우에 따라 적절히 활용해 보세요.</p>
    </div>

    <div class="section">
        <h2>SparkFit 서비스 이용과 관련하여 몇 가지 주의사항이 있습니다.</h2>
        <p>SparkFit는 여러분이 SparkFit 서비스를 자유롭고 편리하게 이용할 수 있도록 최선을 다하고 있습니다. 다만, 여러분이 SparkFit 서비스를 보다 안전하게 이용하고 SparkFit 서비스에서 여러분과 타인의 권리가 서로 존중되고 보호받으려면 여러분의 도움과 협조가 필요합니다. 여러분의 안전한 서비스 이용과 권리 보호를 위해 부득이 아래와 같은 경우 여러분의 게시물 게재나 SparkFit 서비스 이용이 제한될 수 있으므로, 이에 대한 확인 및 준수를 요청 드립니다.</p>
    </div>
      `;

    case 'privacyPolicy':
      return `
      <p>개인정보보호법에 따라 SparkFit에 회원가입 신청하시는 분께 수집하는 개인정보의 항목, 개인정보의 수집 및 이용목적, 개인정보의 보유 및 이용기간, 동의 거부권 및 동의 거부 시 불이익에 관한 사항을 안내 드리오니 자세히 읽은 후 동의하여 주시기 바랍니다.</p>

<h2>1. 수집하는 개인정보</h2>
<p>이용자는 회원가입을 하지 않아도 정보 검색, 뉴스 보기 등 대부분의 SparkFit 서비스를 회원과 동일하게 이용할 수 있습니다. 이용자가 메일, 캘린더, 카페, 블로그 등과 같이 개인화 혹은 회원제 서비스를 이용하기 위해 회원가입을 할 경우, SparkFit는 서비스 이용을 위해 필요한 최소한의 개인정보를 수집합니다.</p>

<p>회원가입 시점에 SparkFit가 이용자로부터 수집하는 개인정보는 아래와 같습니다.</p>
<ul>
  <li>회원 가입 시 필수항목으로 아이디, 비밀번호, 이름, 생년월일, 성별, 휴대전화번호를, 선택항목으로 본인확인 이메일주소를 수집합니다. 실명 인증된 아이디로 가입 시, 암호화된 동일인 식별정보(CI), 중복가입 확인정보(DI), 내외국인 정보를 함께 수집합니다. 만 14세 미만 아동의 경우, 법정대리인의 동의를 받고 있으며, 휴대전화번호 또는 아이핀 인증을 통해 법정대리인의 동의를 확인하고 있습니다. 이 과정에서 법정대리인의 정보(법정대리인의 이름, 중복가입확인정보(DI), 휴대전화번호(아이핀 인증인 경우 아이핀번호))를 추가로 수집합니다.</li>
  <li>비밀번호 없이 회원 가입 시에는 필수항목으로 아이디, 이름, 생년월일, 휴대전화번호를, 선택항목으로 비밀번호를 수집합니다.</li>
  <li>단체 회원가입 시 필수 항목으로 단체아이디, 비밀번호, 단체이름, 이메일주소, 휴대전화번호를, 선택항목으로 단체 대표자명을 수집합니다.</li>
</ul>

<p>서비스 이용 과정에서 이용자로부터 수집하는 개인정보는 아래와 같습니다.</p>
<ul>
  <li>회원정보 또는 개별 서비스에서 프로필 정보(별명, 프로필 사진)를 설정할 수 있습니다. 회원정보에 별명을 입력하지 않은 경우에는 마스킹 처리된 아이디가 별명으로 자동 입력됩니다.</li>
  <li>SparkFit 내의 개별 서비스 이용, 이벤트 응모 및 경품 신청 과정에서 해당 서비스의 이용자에 한해 추가 개인정보 수집이 발생할 수 있습니다. 추가로 개인정보를 수집할 경우에는 해당 개인정보 수집 시점에서 이용자에게 ‘수집하는 개인정보 항목, 개인정보의 수집 및 이용목적, 개인정보의 보관기간’에 대해 안내 드리고 동의를 받습니다.</li>
</ul>

<p>서비스 이용 과정에서 IP 주소, 쿠키, 서비스 이용 기록, 기기정보, 위치정보가 생성되어 수집될 수 있습니다. 또한 이미지 및 음성을 이용한 검색 서비스 등에서 이미지나 음성이 수집될 수 있습니다.</p>

<p>구체적으로 1) 서비스 이용 과정에서 이용자에 관한 정보를 자동화된 방법으로 생성하거나 이용자가 입력한 정보를 저장(수집)하거나, 2) 이용자 기기의 고유한 정보를 원래의 값을 확인하지 못 하도록 안전하게 변환하여 수집합니다.</p>

<p>서비스 이용 과정에서 위치정보가 수집될 수 있으며, SparkFit에서 제공하는 위치기반 서비스에 대해서는 'SparkFit 위치기반서비스 이용약관'에서 자세하게 규정하고 있습니다. 이와 같이 수집된 정보는 개인정보와의 연계 여부 등에 따라 개인정보에 해당할 수 있고, 개인정보에 해당하지 않을 수도 있습니다.</p>

<h3>생성정보 수집에 대한 추가 설명</h3>
<ul>
  <li><strong>IP(Internet Protocol) 주소란?</strong><br>IP 주소는 인터넷 망 사업자가 인터넷에 접속하는 이용자의 PC 등 기기에 부여하는 온라인 주소정보 입니다. IP 주소가 개인정보에 해당하는지 여부에 대해서는 각국마다 매우 다양한 견해가 있습니다.</li>
  <li><strong>서비스 이용기록이란?</strong><br>SparkFit 접속 일시, 이용한 서비스 목록 및 서비스 이용 과정에서 발생하는 정상 또는 비정상 로그 일체,메일 수발신 과정에서 기록되는 이메일주소, 친구 초대하기 또는 선물하기 등에서 입력하는 휴대전화번호, 스마트스토어 판매자와 구매자간 상담내역(SparkFit톡톡 및 상품 Q&A 게시글) 등을 의미합니다. 정보주체가 식별되는 일부 서비스 이용기록(행태정보 포함)과 관련한 처리 목적 등에 대해서는 본 개인정보 처리방침에서 규정하고 있는 수집하는 개인정보, 수집한 개인정보의 이용, 개인정보의 파기 등에서 설명하고 있습니다. 이는 서비스 제공을 위해 수반되는 것으로 이를 거부하시는 경우 서비스 이용에 제한이 있을 수 있으며, 관련하여서는 고객센터로 문의해주시길 바랍니다. 이 외에 정보주체를 식별하지 않고 행태정보를 처리하는 경우와 관련하여서는 'SparkFit 맞춤형 광고 안내'에서 확인하실 수 있습니다.</li>
  <li><strong>기기정보란?</strong><br>본 개인정보처리방침에 기재된 기기정보는 생산 및 판매 과정에서 기기에 부여된 정보뿐 아니라, 기기의 구동을 위해 사용되는 S/W를 통해 확인 가능한 정보를 모두 일컫습니다. OS(Windows, MAC OS 등) 설치 과정에서 이용자가 PC에 부여하는 컴퓨터의 이름, PC에 장착된 주변기기의 일련번호, 스마트폰의 통신에 필요한 고유한 식별값(IMEI, IMSI), AAID 혹은 IDFA, 설정언어 및 설정 표준시, USIM의 통신사 코드 등을 의미합니다. 단, SparkFit는 IMEI와 같은 기기의 고유한 식별값을 수집할 필요가 있는 경우, 이를 수집하기 전에 SparkFit도 원래의 값을 알아볼 수 없는 방식으로 암호화 하여 식별성(Identifiability)을 제거한 후에 수집합니다.</li>
  <li><strong>쿠키(cookie)란?</strong><br>쿠키는 이용자가 웹사이트를 접속할 때에 해당 웹사이트에서 이용자의 웹브라우저를 통해 이용자의 PC에 저장하는 매우 작은 크기의 텍스트 파일입니다. 이후 이용자가 다시 웹사이트를 방문할 경우 웹사이트 서버는 이용자 PC에 저장된 쿠키의 내용을 읽어 이용자가 설정한 서비스 이용 환경을 유지하여 편리한 인터넷 서비스 이용을 가능케 합니다. 또한 방문한 서비스 정보, 서비스 접속 시간 및 빈도, 서비스 이용 과정에서 생성된 또는 제공(입력)한 정보 등을 분석하여 이용자의 취향과 관심에 특화된 서비스(광고 포함)를 제공할 수 있습니다. 이용자는 쿠키에 대한 선택권을 가지고 있으며, 웹브라우저에서 옵션을 설정함으로써 모든 쿠키를 허용하거나, 쿠키가 저장될 때마다 확인을 거치거나, 아니면 모든 쿠키의 저장을 거부할 수도 있습니다. 다만, 쿠키의 저장을 거부할 경우에는 로그인이 필요한 SparkFit 일부 서비스의 이용에 불편이 있을 수 있습니다.</li>
</ul>

<p><strong>웹 브라우저에서 쿠키 허용/차단 방법</strong></p>
<ul>
  <li><strong>크롬(Chrome)</strong>: 웹 브라우저 설정 > 개인정보 보호 및 보안 > 인터넷 사용 기록 삭제</li>
  <li><strong>엣지(Edge)</strong>: 웹 브라우저 설정 > 쿠키 및 사이트 권한 > 쿠키 및 사이트 데이터 관리 및 삭제</li>
</ul>

<p><strong>모바일 브라우저에서 쿠키 허용/차단</strong></p>
<ul>
  <li><strong>크롬(Chrome)</strong>: 모바일 브라우저 설정 > 개인정보 보호 및 보안 > 인터넷 사용 기록 삭제</li>
  <li><strong>사파리(Safari)</strong>: 모바일 기기 설정 > 사파리(Safari) > 고급 > 모든 쿠키 차단</li>
  <li><strong>삼성 인터넷</strong>: 모바일 브라우저 설정 > 인터넷 사용 기록 > 인터넷 사용 기록 삭제</li>
</ul>

<p>쿠키에 관한 자세한 내용(SparkFit 프라이버시 센터) 알아보기</p>

<h2>2. 수집한 개인정보의 이용</h2>
<p>SparkFit 및 SparkFit 관련 제반 서비스(모바일 웹/앱 포함)의 회원관리, 서비스 개발・제공 및 향상, 안전한 인터넷 이용환경 구축 등 아래의 목적으로만 개인정보를 이용합니다.</p>
<ul>
  <li>회원 가입 의사의 확인, 연령 확인 및 법정대리인 동의 진행, 이용자 및 법정대리인의 본인 확인, 이용자 식별, 회원탈퇴 의사의 확인 등 회원관리를 위하여 개인정보를 이용합니다.</li>
  <li>콘텐츠 등 기존 서비스 제공(광고 포함)에 더하여, 인구통계학적 분석, 서비스 방문 및 이용기록의 분석, 개인정보 및 관심에 기반한 이용자간 관계의 형성, 지인 및 관심사 등에 기반한 맞춤형 서비스 제공 등 신규 서비스 요소의 발굴 및 기존 서비스 개선 등을 위하여 개인정보를 이용합니다.</li>
  <li>법령 및 SparkFit 이용약관을 위반하는 회원에 대한 이용 제한 조치, 부정 이용 행위를 포함하여 서비스의 원활한 운영에 지장을 주는 행위에 대한 방지 및 제재, 계정도용 및 부정거래 방지, 약관 개정 등의 고지사항 전달, 분쟁조정을 위한 기록 보존, 민원처리 등 이용자 보호 및 서비스 운영을 위하여 개인정보를 이용합니다.</li>
  <li>유료 서비스 제공에 따르는 본인인증, 구매 및 요금 결제, 상품 및 서비스의 배송을 위하여 개인정보를 이용합니다.</li>
  <li>이벤트 정보 및 참여기회 제공, 광고성 정보 제공 등 마케팅 및 프로모션 목적으로 개인정보를 이용합니다.</li>
  <li>서비스 이용기록과 접속 빈도 분석, 서비스 이용에 대한 통계, 서비스 분석 및 통계에 따른 맞춤 서비스 제공 및 광고 게재 등에 개인정보를 이용합니다.</li>
  <li>보안, 프라이버시, 안전 측면에서 이용자가 안심하고 이용할 수 있는 서비스 이용환경 구축을 위해 개인정보를 이용합니다.</li>
</ul>

<h2>3. 개인정보의 보관기간</h2>
<p>회사는 원칙적으로 이용자의 개인정보를 회원 탈퇴 시 지체없이 파기하고 있습니다.</p>
<p>단, 이용자에게 개인정보 보관기간에 대해 별도의 동의를 얻은 경우, 또는 법령에서 일정 기간 정보보관 의무를 부과하는 경우에는 해당 기간 동안 개인정보를 안전하게 보관합니다.</p>

<p>이용자에게 개인정보 보관기간에 대해 회원가입 시 또는 서비스 가입 시 동의를 얻은 경우는 아래와 같습니다.</p>
<ul>
  <li>부정 가입 및 이용 방지</li>
  <li>SparkFit 서비스 제공을 위한 본인 확인</li>
</ul>

<h2>4. 개인정보 수집 및 이용 동의를 거부할 권리</h2>
<p>이용자는 개인정보의 수집 및 이용 동의를 거부할 권리가 있습니다. 회원가입 시 수집하는 최소한의 개인정보, 즉, 필수 항목에 대한 수집 및 이용 동의를 거부하실 경우, 회원가입이 어려울 수 있습니다.</p>
      `;

    case 'optionalPrivacy':
      return `
      <h3>이벤트・혜택 정보 수신</h3>
        <p>이벤트 및 혜택에 관한 정보 수신에 동의합니다.</p>
        `;

    default:
      return '해당 약관이 없습니다.';
  }
};
