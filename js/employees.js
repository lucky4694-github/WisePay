'use strict';
function renderEmpList() {
  const body=document.getElementById('empListBody');
  const title=document.getElementById('empListTitle');
  title.textContent=(LANG==='JP'?`従業員一覧（${employees.length}名）`:`직원 목록（${employees.length}명）`);
  body.innerHTML='';
  if(!employees.length) {
    body.innerHTML=`<div class="emp-list-empty">${LANG==='JP'?'従業員が登録されていません':'등록된 직원이 없습니다'}</div>`;
    return;
  }
  employees.forEach((emp,i)=>{
    const item=document.createElement('div');
    item.className='emp-list-item'+(i===editingEmpIdx?' active':'');
    const famCnt=countFamilies(emp);
    item.innerHTML=`<div class="emp-list-av">${emp.name.charAt(0)}</div><div class="emp-list-info"><div class="emp-list-name">${emp.name}</div><div class="emp-list-no">${emp.no} · ${LANG==='JP'?'扶養':'부양'} ${famCnt}${LANG==='JP'?'名':'명'}</div></div>`;
    item.onclick=()=>openEmpForm(i);
    body.appendChild(item);
  });
}

function countFamilies(emp) {
  if(!emp.families) return 0;
  return emp.families.filter(f=>{
    if(!f.birth) return false;
    const age = currentYear - parseInt(f.birth.substring(0,4));
    return age >= 16;
  }).length;
}

// ══ EMP FORM (inline) ══
let empFormDirty = false; // 폼 변경 여부 추적

function markDirty() { empFormDirty = true; }

function openEmpForm(idx) {
  // 수정 중인데 다른 직원 선택 시 경고
  if(editingEmpIdx !== -1 && empFormDirty && idx !== editingEmpIdx) {
    const jp = LANG==='JP';
    const msg = jp
      ? '入力中の内容が失われます。このまま移動しますか？'
      : '입력 중인 내용이 사라집니다. 이동하시겠습니까?';
    if(!confirm(msg)) return;
  }

  editingEmpIdx = idx;
  empFormDirty = false;
  const title=document.getElementById('empFormTitle');
  const btns=document.getElementById('empFormBtns');

  if(idx===-1) {
    tempFamilies=[];
    title.textContent=LANG==='JP'?'新規従業員登録':'신규 직원 등록';
    btns.innerHTML=`<button class="btn btn-success btn-sm" onclick="saveEmployee()">${LANG==='JP'?'保存':'저장'}</button><button class="btn btn-sm" onclick="cancelEmpForm()">${LANG==='JP'?'キャンセル':'취소'}</button>`;
    renderEmpFormFields(null);
  } else {
    const emp=employees[idx];
    tempFamilies=JSON.parse(JSON.stringify(emp.families||[]));
    title.textContent=LANG==='JP'?`${emp.name} の編集`:`${emp.name} 편집`;
    btns.innerHTML=`<button class="btn btn-primary btn-sm" onclick="saveEmployee()">${LANG==='JP'?'保存':'저장'}</button><button class="btn btn-danger btn-sm" onclick="deleteEmp(${idx})">${LANG==='JP'?'削除':'삭제'}</button><button class="btn btn-sm" onclick="cancelEmpForm()">${LANG==='JP'?'キャンセル':'취소'}</button>`;
    renderEmpFormFields(emp);
  }
  renderEmpList();
  document.getElementById('empFormBtns').style.display='flex';
}

function cancelEmpForm() {
  if(empFormDirty) {
    const jp = LANG==='JP';
    const msg = jp ? '入力中の内容が失われます。キャンセルしますか？' : '입력 중인 내용이 사라집니다. 취소하시겠습니까?';
    if(!confirm(msg)) return;
  }
  editingEmpIdx=-1;
  tempFamilies=[];
  empFormDirty=false;
  const body=document.getElementById('empFormBody');
  body.innerHTML=`<div style="padding:40px;text-align:center;color:var(--text3);"><div style="font-size:36px;margin-bottom:10px;">👈</div><div>${LANG==='JP'?'左のリストから選択、または「新規」ボタンで登録してください。':'좌측 목록에서 선택하거나 「新規」버튼으로 등록해 주세요.'}</div></div>`;
  document.getElementById('empFormTitle').textContent=LANG==='JP'?'従業員を選択してください':'직원을 선택해 주세요';
  document.getElementById('empFormBtns').innerHTML='';
  renderEmpList();
}

function renderEmpFormFields(emp) {
  const isNew = !emp;
  const v = (k,def='') => emp ? (emp[k]!==undefined&&emp[k]!==''?emp[k]:def) : def;
  const jp=LANG==='JP';

  const html = `
  <div class="form-grid2">
    <div class="form-group">
      <label class="form-label">${jp?'社員番号（4桁）':'사원번호（4자리）'}</label>
      <input class="form-input" id="f-no" maxlength="4" value="${v('no')}"
        oninput="validateEmpNo(this);markDirty()" onblur="padEmpNo(this)"
        onkeydown="focusNext(event,'f-name')">
      <div class="form-error" id="f-no-err"></div>
      <div class="form-hint">${jp?'数字のみ。1桁入力で自動ゼロ埋め（例：1→0001）':'숫자만 입력. 자동 0패딩（예：1→0001）'}</div>
    </div>
    <div class="form-group">
      <label class="form-label">${jp?'氏名':'이름'}</label>
      <input class="form-input" id="f-name" value="${v('name')}"
        oninput="markDirty()" onkeydown="focusNext(event,'f-kana')">
    </div>
    <div class="form-group">
      <label class="form-label">${jp?'カナ（任意）':'카나（선택）'}</label>
      <input class="form-input" id="f-kana" value="${v('kana')}"
        oninput="markDirty()" onkeydown="focusNext(event,'f-join')">
    </div>
    <div class="form-group">
      <label class="form-label">${jp?'入社日':'입사일'}</label>
      <input class="form-input" id="f-join" type="text" value="${v('join')}"
        placeholder="YYYY-MM-DD"
        onblur="validateDateText(this,'f-join-err')" oninput="markDirty()">
      <div class="form-error" id="f-join-err"></div>
    </div>
    <div class="form-group">
      <label class="form-label">${jp?'生年月日':'생년월일'}</label>
      <input class="form-input" id="f-birth" type="text" value="${v('birth')}"
        placeholder="YYYY-MM-DD"
        onblur="validateDateText(this,'f-birth-err')" oninput="markDirty()">
      <div class="form-error" id="f-birth-err"></div>
    </div>
    <div class="form-group">
      <label class="form-label">${jp?'介護保険':'개호보험'}</label>
      <select class="form-select" id="f-kaigo" onchange="markDirty()">
        <option value="auto" ${v('kaigo','auto')==='auto'?'selected':''}>${jp?'自動（年齢で判定）':'자동（나이로 판정）'}</option>
        <option value="yes" ${v('kaigo')==='yes'?'selected':''}>${jp?'対象（40歳以上）':'대상（40세 이상）'}</option>
        <option value="no" ${v('kaigo')==='no'?'selected':''}>${jp?'対象外':'대상 외'}</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">${jp?'雇用保険':'고용보험'}</label>
      <select class="form-select" id="f-koyo" onchange="markDirty()">
        <option value="yes" ${v('koyo','yes')==='yes'?'selected':''}>${jp?'加入':'가입'}</option>
        <option value="no" ${v('koyo')==='no'?'selected':''}>${jp?'未加入':'미가입'}</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">${jp?'所得税区分':'소득세 구분'}</label>
      <select class="form-select" id="f-shotoku-kbn" onchange="markDirty()">
        <option value="ko" ${v('shotokuKbn','ko')==='ko'?'selected':''}>${jp?'甲欄（扶養控除等申告書あり）':'갑란（부양공제신고서 제출）'}</option>
        <option value="otsu" ${v('shotokuKbn')==='otsu'?'selected':''}>${jp?'乙欄（申告書なし）':'을란（신고서 미제출）'}</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">${jp?'扶養親族等の数（所得税用）':'부양친족 수（소득세용）'}</label>
      <select class="form-select" id="f-fuyou" onchange="markDirty()">
        ${[0,1,2,3,4,5,6,7].map(n=>`<option value="${n}" ${parseInt(v('fuyouCount','0'))===n?'selected':''}>${n}${jp?'人':'명'}</option>`).join('')}
      </select>
      <div class="form-hint">${jp?'扶養控除等申告書に記載の人数（配偶者含む）':'부양공제신고서 기재 인원（배우자 포함）'}</div>
    </div>
    <div class="form-group">
      <label class="form-label">${jp?'通勤手当（月額・定期券）':'통근수당（월액・정기권）'}</label>
      <input class="form-input" id="f-commute" type="number" value="${v('commute',0)}"
        oninput="markDirty()">
      <div class="form-hint">${jp?'毎月の給与に自動反映されます':'매월 급여에 자동 반영됩니다'}</div>
    </div>
  </div>

  <div class="fam-section">
    <div class="fam-title">
      <span>${jp?'扶養家族':'부양가족'} <span class="fam-count-badge" id="famCountBadge">0${jp?'名':'명'}</span></span>
      <span style="font-size:11px;color:var(--text3);">${jp?'16歳以上が扶養人数にカウントされます':'만 16세 이상이 부양 인원으로 집계됩니다'}</span>
    </div>
    <div class="fam-add-row">
      <div class="form-group" style="margin:0;">
        <input class="form-input" id="fam-name" onkeydown="if(event.key==='Enter'){event.preventDefault();document.getElementById('fam-birth').focus();}">
      </div>
      <div class="form-group" style="margin:0;">
        <input class="form-input" id="fam-birth" type="text"
          placeholder="YYYY-MM-DD"
          onblur="validateDateText(this,'fam-birth-err')"
          onkeydown="if(event.key==='Enter'){event.preventDefault();addFam();}">
        <div class="form-error" id="fam-birth-err"></div>
      </div>
      <button class="btn btn-success btn-sm" onclick="addFam()">${jp?'追加':'추가'}</button>
      <div></div>
    </div>
    <table class="fam-table">
      <thead><tr><th>${jp?'氏名':'이름'}</th><th>${jp?'生年月日':'생년월일'}</th><th>${jp?'扶養対象':'부양 대상'}</th><th></th></tr></thead>
      <tbody id="famTableBody"></tbody>
    </table>
  </div>`;

  document.getElementById('empFormBody').innerHTML = html;
  renderFamTable();
  updateFamCount();
}

// ══ DATE VALIDATION ══
function today() { return new Date().toISOString().split('T')[0]; }

// text 입력용 날짜 검증 (브라우저 자동보정 없음)
function validateDateText(input, errId) {
  const errEl = document.getElementById(errId);
  if(!errEl) return true;
  const v = input.value.trim();
  if(!v) { errEl.textContent=''; input.classList.remove('error'); return true; }

  // YYYY-MM-DD 형식 파싱
  const match = v.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const jp = LANG==='JP';
  if(!match) {
    errEl.textContent = jp ? '日付はYYYY-MM-DD形式で入力してください（例：1990-04-01）' : '날짜는 YYYY-MM-DD 형식으로 입력해 주세요（예：1990-04-01）';
    input.classList.add('error');
    return false;
  }
  const y=parseInt(match[1]), m=parseInt(match[2]), day=parseInt(match[3]);
  const maxDay = new Date(y, m, 0).getDate();
  if(m < 1 || m > 12) {
    errEl.textContent = jp ? '月は1〜12で入力してください' : '월은 1~12로 입력해 주세요';
    input.classList.add('error'); return false;
  }
  if(day < 1 || day > maxDay) {
    errEl.textContent = jp
      ? `${m}月は${maxDay}日までです。入力し直してください`
      : `${m}월은 ${maxDay}일까지입니다. 다시 입력해 주세요`;
    input.classList.add('error');
    input.value = '';
    return false;
  }
  const d = new Date(y, m-1, day);
  if(d > new Date()) {
    errEl.textContent = jp ? '未来の日付は入力できません' : '미래 날짜는 입력할 수 없습니다';
    input.classList.add('error');
    input.value = '';
    return false;
  }
  errEl.textContent=''; input.classList.remove('error'); return true;
}

// 구 validateDate 호환 (type=date 쓰는 곳 없음, 안전망)
function validateDate(input, errId) { return validateDateText(input, errId); }

function isValidDate(dateStr) {
  if(!dateStr) return true;
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if(!match) return false;
  const y=parseInt(match[1]), m=parseInt(match[2]), day=parseInt(match[3]);
  if(m<1||m>12) return false;
  const maxDay = new Date(y,m,0).getDate();
  if(day<1||day>maxDay) return false;
  if(new Date(y,m-1,day) > new Date()) return false;
  return true;
}

// ══ EMP NO 0패딩 ══
function padEmpNo(input) {
  if(input.value) input.value = input.value.padStart(4,'0');
  validateEmpNo(input);
}

// ══ EMP NO VALIDATION ══
function validateEmpNo(input) {
  input.value = input.value.replace(/\D/g,'');
  if(input.value.length > 4) input.value = input.value.slice(0,4);
  const errEl = document.getElementById('f-no-err');
  if(!errEl) return;
  if(!input.value) { errEl.textContent=''; input.classList.remove('error'); return; }
  const no = input.value.padStart(4,'0');
  // 신규/수정 모두 중복 체크, 수정 시 자기 자신은 제외
  const dup = employees.some((e,i) => {
    if(editingEmpIdx !== -1 && i === editingEmpIdx) return false;
    return String(e.no || '').padStart(4, '0') === no;
  });
  if(dup) {
    errEl.textContent = LANG==='JP'?'この社員番号は既に使用されています':'이미 사용 중인 사원번호입니다';
    input.classList.add('error');
  } else {
    errEl.textContent=''; input.classList.remove('error');
  }
}

// ══ FAMILY ══
function addFam() {
  const name = document.getElementById('fam-name').value.trim();
  const birth = document.getElementById('fam-birth').value;
  const jp = LANG==='JP';
  if(!name) { showToast(jp?'氏名を入力してください':'이름을 입력해 주세요','w'); return; }
  if(!birth) { showToast(jp?'生年月日を入力してください':'생년월일을 입력해 주세요','w'); return; }
  if(!isValidDate(birth)) {
    const errEl = document.getElementById('fam-birth-err');
    if(errEl) errEl.textContent = jp?'有効な日付を入力してください':'유효한 날짜를 입력해 주세요';
    showToast(jp?'有効な日付を入力してください':'유효한 날짜를 입력해 주세요','w'); return;
  }
  tempFamilies.push({name,birth});
  document.getElementById('fam-name').value='';
  document.getElementById('fam-birth').value='';
  renderFamTable(); updateFamCount();
}

function removeFam(i) { tempFamilies.splice(i,1); renderFamTable(); updateFamCount(); }

function renderFamTable() {
  const tbody = document.getElementById('famTableBody');
  if(!tbody) return;
  tbody.innerHTML='';
  const jp=LANG==='JP';
  tempFamilies.forEach((f,i)=>{
    const age = currentYear - parseInt(f.birth.substring(0,4));
    const isTarget = age >= 16;
    const tr=document.createElement('tr');
    tr.innerHTML=`<td>${f.name}</td><td>${f.birth}</td><td><span class="fam-badge ${isTarget?'badge-ok':'badge-no'}">${isTarget?(jp?'対象':'대상'):(jp?'16歳未満':'16세 미만')}</span></td><td><button class="btn btn-sm" onclick="removeFam(${i})" style="color:var(--red);padding:3px 7px;">${jp?'削除':'삭제'}</button></td>`;
    tbody.appendChild(tr);
  });
}

function updateFamCount() {
  const el=document.getElementById('famCountBadge');
  if(!el) return;
  const cnt = tempFamilies.filter(f=>{ if(!f.birth) return false; return (currentYear-parseInt(f.birth.substring(0,4)))>=16; }).length;
  el.textContent = cnt+(LANG==='JP'?'名':'명');
}

// ══ SAVE EMP ══
function saveEmployee() {
  const jp=LANG==='JP';
  const noEl=document.getElementById('f-no');
  const nameEl=document.getElementById('f-name');
  if(!noEl||!nameEl) return;
  let no=noEl.value.trim().replace(/\D/g, '').padStart(4,'0');
  const name=toHalfSpace(nameEl.value.trim());
  const kana=toHalfSpace((document.getElementById('f-kana')?.value||'').trim());
  if(no.replace(/^0+/,'')==='') { showToast(jp?'社員番号を入力してください':'사원번호를 입력해 주세요','w'); return; }
  if(!name) { showToast(jp?'氏名を入力してください':'이름을 입력해 주세요','w'); return; }

  // 중복 체크 - 신규/수정 모두, 수정 시 자기 자신 제외
  const dup = employees.some((e,i) => {
    if(editingEmpIdx !== -1 && i === editingEmpIdx) return false;
    return String(e.no || '').padStart(4, '0') === no;
  });
  if(dup) { showToast(jp?'この社員番号は既に使用されています':'이미 사용 중인 사원번호입니다','e'); return; }

  // 날짜 유효성
  const joinVal=document.getElementById('f-join')?.value;
  const birthVal=document.getElementById('f-birth')?.value;
  if(joinVal && !isValidDate(joinVal)) { showToast(jp?'入社日が無効です':'입사일이 유효하지 않습니다','w'); return; }
  if(birthVal && !isValidDate(birthVal)) { showToast(jp?'生年月日が無効です':'생년월일이 유효하지 않습니다','w'); return; }

  const empData = {
    no, name, kana,
    join: joinVal||'',
    birth: birthVal||'',
    kaigo: document.getElementById('f-kaigo')?.value||'auto',
    koyo: document.getElementById('f-koyo')?.value||'yes',
    shotokuKbn: document.getElementById('f-shotoku-kbn')?.value||'ko',
    fuyouCount: parseInt(document.getElementById('f-fuyou')?.value)||0,
    base: 0,
    commute: parseInt(document.getElementById('f-commute')?.value)||0,
    families: [...tempFamilies],
  };

  if(editingEmpIdx===-1) {
    employees.push(empData);
    // 신규 등록 후 해당 직원 편집 모드로 전환
    editingEmpIdx = employees.length - 1;
  } else {
    const oldNo = employees[editingEmpIdx].no;
    employees[editingEmpIdx] = empData;
    // 사원번호가 변경된 경우 급여 데이터 키도 마이그레이션
    if(oldNo !== no) {
      for(let y = 2020; y <= 2030; y++) {
        for(let m = 1; m <= 12; m++) {
          const oldKey = `kyuyo_p_${oldNo}_${y}_${m}`;
          const val = localStorage.getItem(oldKey);
          if(val) {
            localStorage.setItem(`kyuyo_p_${no}_${y}_${m}`, val);
            localStorage.removeItem(oldKey);
          }
        }
      }
      showToast(jp?`社員番号を ${oldNo} → ${no} に変更し、給与データを移行しました`:`사원번호 ${oldNo} → ${no} 변경 및 급여 데이터 이전 완료`,'s');
    }
  }

  localStorage.setItem(LS.emp,JSON.stringify(employees));
  if(gasUrl) fetch(gasUrl,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'employee',...empData}),mode:'no-cors'}).catch(()=>{});

  empFormDirty = false;
  renderEmpSelect();
  renderEmpList();
  // 저장 후 화면 클리어 없이 제목만 업데이트
  const title = document.getElementById('empFormTitle');
  if(title) title.textContent = LANG==='JP' ? `${name} の編集` : `${name} 편집`;
  // 상단 버튼도 저장→편집 모드로 갱신
  const btns = document.getElementById('empFormBtns');
  if(btns) btns.innerHTML = `<button class="btn btn-primary btn-sm" onclick="saveEmployee()">${LANG==='JP'?'保存':'저장'}</button><button class="btn btn-danger btn-sm" onclick="deleteEmp(${editingEmpIdx})">${LANG==='JP'?'削除':'삭제'}</button><button class="btn btn-sm" onclick="cancelEmpForm()">${LANG==='JP'?'キャンセル':'취소'}</button>`;
  showToast(LANG==='JP'?'従業員情報を保存しました ✓':'직원 정보를 저장했습니다 ✓','s');
}

function deleteEmp(i) {
  const emp=employees[i];
  const msg=LANG==='JP'?`${emp.name} を削除しますか？`:`${emp.name}을(를) 삭제하시겠습니까?`;
  if(!confirm(msg)) return;
  employees.splice(i,1);
  localStorage.setItem(LS.emp,JSON.stringify(employees));
  if(currentEmpIdx>=employees.length) currentEmpIdx=Math.max(0,employees.length-1);
  renderEmpSelect(); renderEmpList(); cancelEmpForm();
  showToast(LANG==='JP'?'削除しました':'삭제했습니다');
}


