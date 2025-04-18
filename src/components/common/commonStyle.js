import styled from 'styled-components';

export const STSection = styled.section`
  display: flex;
  flex-direction: column;
  padding: 0.8rem;
  gap: 1rem;
  width: 100%;
`;

export const STDeadline = styled.div`
  height: min-content;
  padding: 0.3rem 0.5rem;
  border-radius: 5px;
  color: white;
  font-size: 0.7rem;
  font-weight: bold;
  line-height: 1rem;
  text-align: center;
  box-sizing: border-box;

  background-color: ${({ $status }) => {
    switch ($status) {
      case 'dayFuture':
        return '#82C0F9';
      case 'dayToday':
        return '#b1c3f2';
      case 'dayPast':
        return '#f7a9a9';
      default:
        return 'gray';
    }
  }};
`;
export const ApprovalResults = styled.p`
  height: min-content;
  padding: 0.5rem 0.6rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  box-sizing: border-box;
  background-color: ${({ $status }) => ($status ? '#e0f2fe' : '#fee2e2')};
  color: ${({ $status }) => ($status ? '#0369a1' : '#b91c1c')};

  .icon {
    font-size: 0.8rem;
  }

  .label {
    font-size: 0.6rem;
  }

  &:hover {
    background-color: ${({ $status }) => ($status ? '#bae6fd' : '#fecaca')}; /* hover 시 조금 더 진하게 */
  }
`;
