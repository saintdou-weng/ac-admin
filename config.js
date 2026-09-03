window.AC_CONFIG = {
  appName: 'AC Admin Center',
  version: '1.0.0',
  repo: 'ac-admin',
  gasProject: 'AC_ADMIN_CENTER',
  telegramBot: 'ac_admin_center_bot',
  telegramChatId: '-5446063094',
  platformOwner: 'saintdou-weng',
  platforms: [
    {id:'hra', name:'AC-HRA Portal', zh:'人事中心', icon:'👥', repo:'ac-hra-portal', url:'https://saintdou-weng.github.io/ac-hra-portal/', gas:'https://script.google.com/macros/s/AKfycbwVxpnEQGhEHkKt6RTTp-EEEf8Unr7qg0yITiyu8zIXS1tHJrKZL73To7FOikBsatKU/exec', probe:'status'},
    {id:'pay', name:'AC-HRA Payroll', zh:'薪資中心', icon:'💵', repo:'ac-hra-pay', url:'https://saintdou-weng.github.io/ac-hra-pay/', gas:'https://script.google.com/macros/s/AKfycbwmmRduvOe5RdnR_iALwEIi_6lQaTq4SXH88jmoIjiHwTsTrW5qnlPTr8PSmOT7C2rdGg/exec', probe:'status'},
    {id:'ga', name:'AC-GA Expense', zh:'總務費用', icon:'🧾', repo:'ac-ga-exp', url:'https://saintdou-weng.github.io/ac-ga-exp/', gas:'https://script.google.com/macros/s/AKfycbwVxpnEQGhEHkKt6RTTp-EEEf8Unr7qg0yITiyu8zIXS1tHJrKZL73To7FOikBsatKU/exec', probe:'dashboard'},
    {id:'gas', name:'AC-GAS Check', zh:'環安／巡檢', icon:'🧰', repo:'ac-gascheck', url:'https://saintdou-weng.github.io/ac-gascheck/', gas:'https://script.google.com/macros/s/AKfycbwmg4lR3Ksng1g6zSkJHd2QNTgN_kC_bnkKrIn85VYPYfrGlhmuibuDaPdM0HOvgyml/exec', probe:'status'},
    {id:'sec', name:'AC-Security', zh:'保全中心', icon:'🛡️', repo:'ac-gas-sec', url:'https://saintdou-weng.github.io/ac-gas-sec/', gas:'https://script.google.com/macros/s/AKfycbyxBN_t2AfxTPQ3AYdt7Jxl3pNiJV17H1T0pub4SR8GBgDH47WnDn9JF556KSxUiIU-/exec', probe:'ping'},
    {id:'audit', name:'AC-Audit', zh:'驗廠／合規', icon:'📋', repo:'ac-audit', url:'https://saintdou-weng.github.io/ac-audit/', gas:'https://script.google.com/macros/s/AKfycbxN61TQr2S_tKxSgGKJe_yjNVpPAdu_YRw-8pByWiHDCWdJpcGNCk2c2Li1yGQdkRcB_Q/exec', probe:'ping'}
  ]
};
