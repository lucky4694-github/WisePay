'use strict';
function setTxt(id, jp, kr) {
  const el = document.getElementById(id);
  if (el) el.textContent = LANG === 'JP' ? jp : kr;
}

function toggleLang() {
  LANG = LANG === 'JP' ? 'KR' : 'JP';
  localStorage.setItem(LS.lang, LANG);
  applyLang();

  renderMonthTabs();
  renderEmpSelect();
  renderEmpList();
  updateGasStatus();
  recalc();

  showToast(
    LANG === 'JP' ? '日本語に切り替えました' : '한국어로 전환했습니다',
    's'
  );
}

function applyLang() {
  document.documentElement.lang = LANG === 'JP' ? 'ja' : 'ko';

  setTxt('t-appname', '給与計算', '급여 계산');
  setTxt('t-nav-main', 'メイン', '메인');
  setTxt('t-nav-payroll', '給与明細', '급여 명세');
  setTxt('t-nav-history', '支給履歴', '지급 이력');
  setTxt('t-nav-annual', '年間給与一覧', '연간 급여 일람');
  setTxt('t-nav-setting', '設定', '설정');
  setTxt('t-nav-emp', '従業員管理', '직원 관리');
  setTxt('t-emp-add', '+ 新規', '+ 직원 추가');
  setTxt('t-nav-rates', '保険料率設定', '보험료율 설정');
  setTxt('t-nav-gas', 'Google連携設定', 'Google 연동 설정');

  setTxt('t-langbtn', '한국어로 전환', '日本語に切替');
  setTxt('t-ai-btn', '最新料率を取得', '최신 요율 가져오기');
  setTxt('t-save-btn', '保存', '저장');
  setTxt('t-print-btn', '印刷', '인쇄');

  setTxt('t-net-label', '差引総支給額（手取り）', '차인지급액');
  setTxt('t-card-shikyuu', '支給', '지급');
  setTxt('t-card-kojo', '控除', '공제');

  setTxt('t-r-base', '月給', '월급');
  setTxt('t-r-ot', '残業手当', '잔업수당');
  setTxt('t-r-kintai', '勤怠控除', '근태공제');
  setTxt('t-r-commute', '非課税通勤手当', '비과세 교통비');
  setTxt('t-r-commutetax', '課税通勤手当', '과세 교통비');
  setTxt('t-r-kinmu', '勤務手当', '근무수당');
  setTxt('t-r-shokumu', '職務手当', '직무수당');
  setTxt('t-r-field', '現場手当', '현장수당');
  setTxt('t-r-total', '計', '합계');

  setTxt('t-k-kenko', '健康保険料', '건강보험료');
  setTxt('t-k-kaigo', '介護保険料', '개호보험료');
  setTxt('t-k-kodomo', '子ども・子育て支援金', '자녀・육아지원금');
  setTxt('t-k-nenkin', '厚生年金保険料', '후생연금보험료');
  setTxt('t-k-koyo', '雇用保険料', '고용보험료');
  setTxt('t-k-shotoku', '所得税', '소득세');
  setTxt('t-k-jumin', '住民税', '주민세');
  setTxt('t-k-nencho', '年末調整精算額', '연말정산 정산액');
  setTxt('t-k-total', '計', '합계');

  setTxt('t-gas-title', '🔗 Google スプレッドシート連携設定', '🔗 Google 스프레드시트 연동 설정');
  setTxt('t-gas-cancel', 'キャンセル', '취소');
  setTxt('t-gas-test', '🔌 接続テスト', '🔌 접속 테스트');
  setTxt('t-gas-save', '保存して連携', '저장하고 연동');

  updateGasStatus();
}

