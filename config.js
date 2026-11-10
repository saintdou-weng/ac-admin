window.AC_CONFIG = {
  "appName": "AC Admin Center",
  "version": "2.1.0",
  "repo": "ac-admin",
  "gasProject": "AC_ADMIN_CENTER",
  "telegramBot": "ac_admin_center_bot",
  "platformOwner": "saintdou-weng",
  "platforms": [
    {
      "id": "psjhr",
      "name": "VRT HR (PSJHR)",
      "zh": "人事系統 VRT HR",
      "km": "ប្រព័ន្ធ HR",
      "icon": "🧑‍💼",
      "repo": "psjhr",
      "url": "https://saintdou-weng.github.io/psjhr/",
      "gas": "https://script.google.com/macros/s/AKfycbx9Pdt5vu_AcTHCrlLH4lcVONXS_VoE47SEjDUn7Iv27C2CRgoADRLpalVIJQHWBcqK/exec",
      "probe": "ping",
      "identity": [
        "psjhr",
        "hr"
      ],
      "localKeys": [],
      "quick": [],
      "source": "ERP module added 2026-11-10"
    },
    {
      "id": "psjerp",
      "name": "VRT ERP (PSJERP)",
      "zh": "ERP 系統 VRT ERP",
      "km": "ប្រព័ន្ធ ERP",
      "icon": "🗂️",
      "repo": "PSJERP",
      "url": "https://saintdou-weng.github.io/PSJERP/",
      "gas": "https://script.google.com/macros/s/AKfycbzyAaaKlMGdot9YtYAlBp-dktm2xRr_aHbOcQ-TNfouERMjuq4iCfRhCY0_3LsPa2mL/exec",
      "probe": "ping",
      "identity": [
        "psjerp",
        "erp"
      ],
      "localKeys": [],
      "quick": [
        {
          "label": {
            "zh": "生產",
            "en": "Production",
            "km": "ផលិតកម្ម"
          },
          "url": "https://saintdou-weng.github.io/PSJERP/?s=prod"
        },
        {
          "label": {
            "zh": "財務／會計",
            "en": "Finance",
            "km": "ហិរញ្ញវត្ថុ"
          },
          "url": "https://saintdou-weng.github.io/PSJERP/?s=fin"
        }
      ],
      "source": "ERP module added 2026-11-10"
    },
    {
      "id": "psjga",
      "name": "VRT GA (PSJGA)",
      "zh": "總務系統 VRT GA",
      "km": "ប្រព័ន្ធ GA",
      "icon": "🧹",
      "repo": "PSJGAS",
      "url": "https://saintdou-weng.github.io/PSJGAS/",
      "gas": "https://script.google.com/macros/s/AKfycbzE50qR1ZV83_ywYEXlgnHJ16reJKvrttFSV4s37yVIqIVPseXEf4w2ZVCCM2GSmM7NXw/exec",
      "probe": "ping",
      "identity": [
        "psjga",
        "ga"
      ],
      "localKeys": [],
      "quick": [],
      "source": "ERP module added 2026-11-10"
    },
    {
      "id": "hra",
      "name": "AC-HRA Portal",
      "zh": "人事中心",
      "icon": "👥",
      "repo": "ac-hra-portal",
      "url": "https://saintdou-weng.github.io/ac-hra-portal/hra_portal_v2.html",
      "gas": "https://script.google.com/macros/s/AKfycbwVxpnEQGhEHkKt6RTTp-EEEf8Unr7qg0yITiyu8zIXS1tHJrKZL73To7FOikBsatKU/exec",
      "probe": "status",
      "km": "មជ្ឈមណ្ឌលធនធានមនុស្ស",
      "identity": [
        "hra",
        "attendance",
        "ga_att"
      ],
      "localKeys": [
        "vrt_att_cloud_v1_url",
        "ac_hra_gas_url"
      ],
      "quick": [
        {
          "label": {
            "zh": "出勤",
            "en": "Attendance",
            "km": "វត្តមាន"
          },
          "url": "https://saintdou-weng.github.io/ac-hra-portal/ac_hra_attendance_v1.html"
        },
        {
          "label": {
            "zh": "合約",
            "en": "Contract",
            "km": "កិច្ចសន្យា"
          },
          "url": "https://saintdou-weng.github.io/ac-hra-portal/ac_hra_contract_v2.html"
        },
        {
          "label": {
            "zh": "請假",
            "en": "Leave",
            "km": "ការឈប់សម្រាក"
          },
          "url": "https://saintdou-weng.github.io/ac-hra-portal/ac_hra_employee_leave_v1.html"
        }
      ],
      "source": "Repository source checked 2026-09-06"
    },
    {
      "id": "pay",
      "name": "AC-HRA Payroll",
      "zh": "薪資中心",
      "icon": "💵",
      "repo": "ac-hra-pay",
      "url": "https://saintdou-weng.github.io/ac-hra-pay/",
      "gas": "https://script.google.com/macros/s/AKfycbwmmRduvOe5RdnR_iALwEIi_6lQaTq4SXH88jmoIjiHwTsTrW5qnlPTr8PSmOT7C2rdGg/exec",
      "probe": "status",
      "km": "មជ្ឈមណ្ឌលប្រាក់ខែ",
      "identity": [
        "pay",
        "hra"
      ],
      "localKeys": [
        "hrpay_gas_url"
      ],
      "quick": [
        {
          "label": {
            "zh": "薪資",
            "en": "Payroll",
            "km": "ប្រាក់ខែ"
          },
          "url": "https://saintdou-weng.github.io/ac-hra-pay/payroll.html"
        },
        {
          "label": {
            "zh": "預支",
            "en": "Advance",
            "km": "បុរេប្រទាន"
          },
          "url": "https://saintdou-weng.github.io/ac-hra-pay/advance_pay.html"
        },
        {
          "label": {
            "zh": "加班",
            "en": "OT",
            "km": "ម៉ោងបន្ថែម"
          },
          "url": "https://saintdou-weng.github.io/ac-hra-pay/ot_bonus.html"
        }
      ],
      "source": "Repository source checked 2026-09-06"
    },
    {
      "id": "ga",
      "name": "AC-GA Expense",
      "zh": "總務費用",
      "icon": "🧾",
      "repo": "ac-ga-exp",
      "url": "https://saintdou-weng.github.io/ac-ga-exp/",
      "gas": "https://script.google.com/macros/s/AKfycbxPTXdEhjb4vhAxO-fQYYLnt_m4BZNkVsPiYVmyUzA-kxgr_b4VMC9yayXQCOS7xYYWAQ/exec",
      "probe": "dashboard",
      "km": "ចំណាយរដ្ឋបាល",
      "identity": [
        "ga",
        "exp"
      ],
      "localKeys": [],
      "quick": [
        {
          "label": {
            "zh": "採購",
            "en": "Procurement",
            "km": "លទ្ធកម្ម"
          },
          "url": "https://saintdou-weng.github.io/ac-ga-exp/procurement.html"
        },
        {
          "label": {
            "zh": "費用",
            "en": "Expense",
            "km": "ចំណាយ"
          },
          "url": "https://saintdou-weng.github.io/ac-ga-exp/expense.html"
        }
      ],
      "source": "Repository source checked 2026-09-06",
      "localConfig": {
        "key": "ac_ga_exp_config",
        "field": "gasUrl"
      }
    },
    {
      "id": "gas",
      "name": "AC-GAS Check",
      "zh": "環安／巡檢",
      "icon": "🧰",
      "repo": "ac-gascheck",
      "url": "https://saintdou-weng.github.io/ac-gascheck/ac_gascheck_portal_v1.html",
      "gas": "https://script.google.com/macros/s/AKfycbzRsf_DuYJu0kXxqefR8qbLWhO7uz2flCY7jkPQQ73ZMwptcHDwrtJnhBQFwxG_EM3v/exec",
      "probe": "status",
      "km": "បរិស្ថាន និងត្រួតពិនិត្យ",
      "identity": [
        "gas",
        "check",
        "ehs"
      ],
      "localKeys": [],
      "quick": [
        {
          "label": {
            "zh": "溫度",
            "en": "Temperature",
            "km": "សីតុណ្ហភាព"
          },
          "url": "https://saintdou-weng.github.io/ac-gascheck/ac_gascheck_temperature_v2.html"
        },
        {
          "label": {
            "zh": "清潔",
            "en": "Cleaning",
            "km": "អនាម័យ"
          },
          "url": "https://saintdou-weng.github.io/ac-gascheck/ac_gascheck_cleaning_v2.html"
        }
      ],
      "source": "Repository source checked 2026-09-06"
    },
    {
      "id": "sec",
      "name": "AC-Security",
      "zh": "保全中心",
      "icon": "🛡️",
      "repo": "ac-gas-sec",
      "url": "https://saintdou-weng.github.io/ac-gas-sec/",
      "gas": "https://script.google.com/macros/s/AKfycbyxBN_t2AfxTPQ3AYdt7Jxl3pNiJV17H1T0pub4SR8GBgDH47WnDn9JF556KSxUiIU-/exec",
      "probe": "ping",
      "km": "មជ្ឈមណ្ឌលសន្តិសុខ",
      "identity": [
        "sec"
      ],
      "localKeys": [],
      "quick": [
        {
          "label": {
            "zh": "巡邏",
            "en": "Patrol",
            "km": "ល្បាត"
          },
          "url": "https://saintdou-weng.github.io/ac-gas-sec/ac_sec_patrol_v2.html"
        },
        {
          "label": {
            "zh": "消防",
            "en": "Fire",
            "km": "អគ្គិភ័យ"
          },
          "url": "https://saintdou-weng.github.io/ac-gas-sec/ac_sec_fire_v1.html"
        },
        {
          "label": {
            "zh": "貨櫃",
            "en": "Container",
            "km": "កុងតឺន័រ"
          },
          "url": "https://saintdou-weng.github.io/ac-gas-sec/ac_sec_container_v2.html"
        }
      ],
      "source": "Repository source checked 2026-09-06"
    },
    {
      "id": "audit",
      "name": "AC-Audit",
      "zh": "驗廠／合規",
      "icon": "📋",
      "repo": "ac-audit",
      "url": "https://saintdou-weng.github.io/ac-audit/audit_hub_main.html",
      "gas": "https://script.google.com/macros/s/AKfycbxN61TQr2S_tKxSgGKJe_yjNVpPAdu_YRw-8pByWiHDCWdJpcGNCk2c2Li1yGQdkRcB_Q/exec",
      "probe": "ping",
      "km": "សវនកម្ម និងអនុលោមភាព",
      "identity": [
        "audit"
      ],
      "localKeys": [],
      "quick": [
        {
          "label": {
            "zh": "驗廠",
            "en": "Audit",
            "km": "សវនកម្ម"
          },
          "url": "https://saintdou-weng.github.io/ac-audit/ac_audit_platform_v1.html"
        },
        {
          "label": {
            "zh": "文件",
            "en": "Documents",
            "km": "ឯកសារ"
          },
          "url": "https://saintdou-weng.github.io/ac-audit/VRT_DCC_v2.html"
        }
      ],
      "source": "Repository source checked 2026-09-06"
    },
    {
      "id": "prod",
      "name": "VRT Production",
      "zh": "生產中心",
      "km": "មជ្ឈមណ្ឌលផលិតកម្ម",
      "icon": "🏭",
      "repo": "vrt-prod",
      "url": "https://saintdou-weng.github.io/vrt-prod/portal_v2.html",
      "gas": "",
      "localKeys": [
        "vrt_portal_gas_url"
      ],
      "identity": [
        "prod",
        "vrt"
      ],
      "probe": "status",
      "quick": [
        {
          "label": {
            "zh": "車縫",
            "en": "Sewing",
            "km": "ដេរ"
          },
          "url": "https://saintdou-weng.github.io/vrt-prod/sewing_v5.html"
        },
        {
          "label": {
            "zh": "排單",
            "en": "Planning",
            "km": "ផែនការ"
          },
          "url": "https://saintdou-weng.github.io/vrt-prod/production_plan_capacity_v1.html"
        }
      ],
      "source": "Repository source checked 2026-09-06"
    },
    {
      "id": "acc",
      "name": "VRT ACC Flow / Cost",
      "zh": "會計／製造成本",
      "km": "គណនេយ្យ និងថ្លៃដើមផលិតកម្ម",
      "icon": "📊",
      "repo": "vrt-acc-flow-cost",
      "url": "https://saintdou-weng.github.io/PSJERP/?s=fin#acc-overview",
      "gas": "https://script.google.com/macros/s/AKfycbzojXP0ixSsJqO1Ri2lfkdazTF-9XxoDqRYI0B4OEThkvjc95zacRflYtuArOd8ewHp/exec",
      "localKeys": [],
      "identity": [
        "acc",
        "cost"
      ],
      "probe": "ping",
      "quick": [
        {
          "label": {
            "zh": "WIP",
            "en": "WIP",
            "km": "WIP"
          },
          "url": "https://saintdou-weng.github.io/PSJERP/?s=fin#acc-wip"
        },
        {
          "label": {
            "zh": "成品入庫",
            "en": "FG inbound",
            "km": "FG"
          },
          "url": "https://saintdou-weng.github.io/PSJERP/?s=fin#acc-fg"
        },
        {
          "label": {
            "zh": "製造費用",
            "en": "Factory expense",
            "km": "ចំណាយរោងចក្រ"
          },
          "url": "https://saintdou-weng.github.io/PSJERP/?s=fin#acc-expense"
        }
      ],
      "source": "Accounting pages shown in PSJERP finance since 2026-11-06; launcher repointed 2026-11-10"
    },
    {
      "id": "salary",
      "name": "VRT Salary Structure",
      "zh": "薪資架構／人工成本",
      "km": "រចនាសម្ព័ន្ធប្រាក់ខែ និងថ្លៃពលកម្ម",
      "icon": "💰",
      "repo": "vrt-acc-flow-cost",
      "url": "https://saintdou-weng.github.io/vrt-acc-flow-cost/modules/salary-management.html",
      "gas": "",
      "parent": "acc",
      "probe": "",
      "localKeys": [],
      "identity": [],
      "quick": [],
      "source": "Current repository salary-management.html read 2026-09-13; original archive retained"
    }
  ],
  "verifiedAt": "2026-11-11",
  "timezone": "Asia/Phnom_Penh",
  "hubUrl": "https://script.google.com/macros/s/AKfycbyEWtDE39lzCC_qAIyXNTojWOHlAJj35hnBcj3ayePtJOBhG_zydaQ60AaI2NkMCyo2/exec",
  "authMode": "google-owner",
  "learningHub": "https://saintdou-weng.github.io/vrt-acc-flow-cost/learn/",
  "systems": [
    {
      "id": "erp",
      "icon": "🏭",
      "color": "#0d8074",
      "zh": "生產營運",
      "en": "Production & ERP",
      "km": "ផលិតកម្ម ERP",
      "sub": {
        "zh": "訂單・物料・生產・成本",
        "en": "Orders · materials · production · cost",
        "km": "បញ្ជាទិញ · ផលិតកម្ម · ថ្លៃដើម"
      },
      "name": "VRT ERP",
      "mode": "hash",
      "url": "https://saintdou-weng.github.io/PSJERP/",
      "gas": "https://script.google.com/macros/s/AKfycbzyAaaKlMGdot9YtYAlBp-dktm2xRr_aHbOcQ-TNfouERMjuq4iCfRhCY0_3LsPa2mL/exec",
      "probe": "ping",
      "pages": [
        {
          "k": "dashboard",
          "zh": "總覽",
          "en": "Overview",
          "g": "總覽",
          "ge": "Overview",
          "ic": "📊"
        },
        {
          "k": "smart-import",
          "zh": "智慧匯入",
          "en": "Smart import",
          "g": "總覽",
          "ge": "Overview",
          "ic": "🧠"
        },
        {
          "k": "orders",
          "zh": "訂單 / PO",
          "en": "Orders / PO",
          "g": "訂單與物料",
          "ge": "Orders & materials",
          "ic": "🧾"
        },
        {
          "k": "bom",
          "zh": "BOM 用料",
          "en": "BOM",
          "g": "訂單與物料",
          "ge": "Orders & materials",
          "ic": "🧵"
        },
        {
          "k": "purchase",
          "zh": "採購",
          "en": "Purchasing",
          "g": "訂單與物料",
          "ge": "Orders & materials",
          "ic": "🛒"
        },
        {
          "k": "pprice",
          "zh": "採購單價",
          "en": "Purchase prices",
          "g": "訂單與物料",
          "ge": "Orders & materials",
          "ic": "🏷️"
        },
        {
          "k": "receiving",
          "zh": "進貨驗收",
          "en": "Receiving",
          "g": "訂單與物料",
          "ge": "Orders & materials",
          "ic": "📥"
        },
        {
          "k": "fabric",
          "zh": "布料",
          "en": "Fabric",
          "g": "訂單與物料",
          "ge": "Orders & materials",
          "ic": "🧶"
        },
        {
          "k": "accessories",
          "zh": "輔料",
          "en": "Trims",
          "g": "訂單與物料",
          "ge": "Orders & materials",
          "ic": "🧷"
        },
        {
          "k": "stockmove",
          "zh": "主副料進耗存",
          "en": "Material movement",
          "g": "訂單與物料",
          "ge": "Orders & materials",
          "ic": "🔁"
        },
        {
          "k": "production",
          "zh": "生產",
          "en": "Production",
          "g": "生產與出貨",
          "ge": "Production & shipping",
          "ic": "🏭"
        },
        {
          "k": "wip",
          "zh": "在製 WIP",
          "en": "WIP",
          "g": "生產與出貨",
          "ge": "Production & shipping",
          "ic": "⏳"
        },
        {
          "k": "finished-goods",
          "zh": "成品入庫",
          "en": "FG inbound",
          "g": "生產與出貨",
          "ge": "Production & shipping",
          "ic": "📦"
        },
        {
          "k": "fgstock",
          "zh": "成品庫存",
          "en": "FG stock",
          "g": "生產與出貨",
          "ge": "Production & shipping",
          "ic": "🗃️"
        },
        {
          "k": "shipping",
          "zh": "出貨",
          "en": "Shipping",
          "g": "生產與出貨",
          "ge": "Production & shipping",
          "ic": "🚢"
        },
        {
          "k": "factory-cost",
          "zh": "製造費用",
          "en": "Factory cost",
          "g": "成本",
          "ge": "Cost",
          "ic": "💰"
        },
        {
          "k": "labor",
          "zh": "人工彙總",
          "en": "Labour summary",
          "g": "成本",
          "ge": "Cost",
          "ic": "👷"
        },
        {
          "k": "costing",
          "zh": "成本分析",
          "en": "Costing",
          "g": "成本",
          "ge": "Cost",
          "ic": "🧮"
        },
        {
          "k": "sync",
          "zh": "同步中心",
          "en": "Sync centre",
          "g": "資料中樞",
          "ge": "Data hub",
          "ic": "🔄"
        },
        {
          "k": "compare",
          "zh": "比對中心",
          "en": "Compare",
          "g": "資料中樞",
          "ge": "Data hub",
          "ic": "🔍"
        },
        {
          "k": "exceptions",
          "zh": "異常中心",
          "en": "Exceptions",
          "g": "資料中樞",
          "ge": "Data hub",
          "ic": "⚠️"
        },
        {
          "k": "reports",
          "zh": "報告",
          "en": "Reports",
          "g": "資料中樞",
          "ge": "Data hub",
          "ic": "📑"
        }
      ],
      "tag": "ERP"
    },
    {
      "id": "hr",
      "icon": "🧑‍💼",
      "color": "#2563eb",
      "zh": "人事薪資",
      "en": "HR & Payroll",
      "km": "ធនធានមនុស្ស",
      "sub": {
        "zh": "員工・出勤・薪資福利",
        "en": "People · attendance · pay",
        "km": "បុគ្គលិក · វត្តមាន · ប្រាក់ខែ"
      },
      "name": "VRT HR",
      "mode": "hash",
      "url": "https://saintdou-weng.github.io/psjhr/",
      "gas": "https://script.google.com/macros/s/AKfycbx9Pdt5vu_AcTHCrlLH4lcVONXS_VoE47SEjDUn7Iv27C2CRgoADRLpalVIJQHWBcqK/exec",
      "probe": "ping",
      "pages": [
        {
          "k": "dashboard",
          "zh": "總覽",
          "en": "Overview",
          "g": "總覽",
          "ge": "Overview",
          "ic": "📊"
        },
        {
          "k": "smart-import",
          "zh": "智慧匯入",
          "en": "Smart import",
          "g": "總覽",
          "ge": "Overview",
          "ic": "🧠"
        },
        {
          "k": "emp",
          "zh": "員工",
          "en": "Employees",
          "g": "人員",
          "ge": "People",
          "ic": "👤"
        },
        {
          "k": "joinleave",
          "zh": "到職 / 離職",
          "en": "Joiners / leavers",
          "g": "人員",
          "ge": "People",
          "ic": "🔁"
        },
        {
          "k": "annual",
          "zh": "特休",
          "en": "Annual leave",
          "g": "人員",
          "ge": "People",
          "ic": "🌴"
        },
        {
          "k": "union",
          "zh": "工會",
          "en": "Union",
          "g": "人員",
          "ge": "People",
          "ic": "🛡"
        },
        {
          "k": "x-hra-mat",
          "zh": "產假",
          "en": "Maternity",
          "g": "人員",
          "ge": "People",
          "ic": "🤱"
        },
        {
          "k": "x-hra-man",
          "zh": "人力需求",
          "en": "Manpower",
          "g": "人員",
          "ge": "People",
          "ic": "👷"
        },
        {
          "k": "x-hra-cert",
          "zh": "證照／簽證",
          "en": "Certificates / visas",
          "g": "人員",
          "ge": "People",
          "ic": "🛂"
        },
        {
          "k": "x-pay-warn",
          "zh": "警告",
          "en": "Warnings",
          "g": "人員",
          "ge": "People",
          "ic": "📛"
        },
        {
          "k": "att",
          "zh": "考勤工時",
          "en": "Attendance",
          "g": "出勤",
          "ge": "Time & attendance",
          "ic": "🕒"
        },
        {
          "k": "leave",
          "zh": "請假",
          "en": "Leave",
          "g": "出勤",
          "ge": "Time & attendance",
          "ic": "📝"
        },
        {
          "k": "holiday",
          "zh": "假日行事曆",
          "en": "Holidays",
          "g": "出勤",
          "ge": "Time & attendance",
          "ic": "📅"
        },
        {
          "k": "x-pay-ot",
          "zh": "加班獎金",
          "en": "OT bonus",
          "g": "出勤",
          "ge": "Time & attendance",
          "ic": "⏱️"
        },
        {
          "k": "x-pay-stop",
          "zh": "停工",
          "en": "Shutdown",
          "g": "出勤",
          "ge": "Time & attendance",
          "ic": "🛑"
        },
        {
          "k": "basepay",
          "zh": "薪資設定",
          "en": "Pay setup",
          "g": "薪資福利",
          "ge": "Pay & benefits",
          "ic": "💵"
        },
        {
          "k": "payroll",
          "zh": "薪資估算",
          "en": "Payroll",
          "g": "薪資福利",
          "ge": "Pay & benefits",
          "ic": "💰"
        },
        {
          "k": "recon",
          "zh": "薪資核對",
          "en": "Pay reconciliation",
          "g": "薪資福利",
          "ge": "Pay & benefits",
          "ic": "🧮"
        },
        {
          "k": "meal",
          "zh": "伙食費",
          "en": "Meal fee",
          "g": "薪資福利",
          "ge": "Pay & benefits",
          "ic": "🍚"
        },
        {
          "k": "trans",
          "zh": "交通／住宿",
          "en": "Transport / housing",
          "g": "薪資福利",
          "ge": "Pay & benefits",
          "ic": "🚌"
        },
        {
          "k": "benefits",
          "zh": "福利結算",
          "en": "Benefits",
          "g": "薪資福利",
          "ge": "Pay & benefits",
          "ic": "🎁"
        },
        {
          "k": "sync",
          "zh": "同步中心",
          "en": "Sync centre",
          "g": "資料中樞",
          "ge": "Data hub",
          "ic": "🔄"
        },
        {
          "k": "reports",
          "zh": "報告",
          "en": "Reports",
          "g": "資料中樞",
          "ge": "Data hub",
          "ic": "📑"
        }
      ],
      "tag": "HR"
    },
    {
      "id": "ga",
      "icon": "🧹",
      "color": "#8760c8",
      "zh": "總務保全",
      "en": "GA & Security",
      "km": "កិច្ចការទូទៅ",
      "sub": {
        "zh": "保全・巡檢・宿舍・採購費用",
        "en": "Security · inspections · dorms · expense",
        "km": "សន្តិសុខ · ត្រួតពិនិត្យ · ចំណាយ"
      },
      "name": "VRT GA",
      "mode": "hash",
      "url": "https://saintdou-weng.github.io/PSJGAS/",
      "gas": "https://script.google.com/macros/s/AKfycbzE50qR1ZV83_ywYEXlgnHJ16reJKvrttFSV4s37yVIqIVPseXEf4w2ZVCCM2GSmM7NXw/exec",
      "probe": "ping",
      "pages": [
        {
          "k": "overview",
          "zh": "總務總覽",
          "en": "GA overview",
          "g": "工作空間",
          "ge": "Workspace",
          "ic": "📊"
        },
        {
          "k": "tasks",
          "zh": "待辦中心",
          "en": "Tasks",
          "g": "工作空間",
          "ge": "Workspace",
          "ic": "📋"
        },
        {
          "k": "records",
          "zh": "全部紀錄",
          "en": "All records",
          "g": "工作空間",
          "ge": "Workspace",
          "ic": "🗂"
        },
        {
          "k": "reports",
          "zh": "分析報表",
          "en": "Reports",
          "g": "工作空間",
          "ge": "Workspace",
          "ic": "📈"
        },
        {
          "k": "sec.patrol",
          "zh": "保安巡邏",
          "en": "Security patrol",
          "g": "門禁與安全",
          "ge": "Security & access",
          "ic": "🛡"
        },
        {
          "k": "sec.cctv",
          "zh": "CCTV 監控",
          "en": "CCTV",
          "g": "門禁與安全",
          "ge": "Security & access",
          "ic": "📹"
        },
        {
          "k": "sec.container",
          "zh": "貨櫃出入",
          "en": "Containers",
          "g": "門禁與安全",
          "ge": "Security & access",
          "ic": "🚛"
        },
        {
          "k": "sec.attendance",
          "zh": "保安出勤",
          "en": "Guard attendance",
          "g": "門禁與安全",
          "ge": "Security & access",
          "ic": "🕒"
        },
        {
          "k": "sec.commute",
          "zh": "通勤與門禁",
          "en": "Commute & gate",
          "g": "門禁與安全",
          "ge": "Security & access",
          "ic": "🚪"
        },
        {
          "k": "sec.fire",
          "zh": "消防設施",
          "en": "Fire safety",
          "g": "門禁與安全",
          "ge": "Security & access",
          "ic": "🧯"
        },
        {
          "k": "sec.personnel",
          "zh": "保安人員",
          "en": "Security staff",
          "g": "門禁與安全",
          "ge": "Security & access",
          "ic": "👮"
        },
        {
          "k": "gc.temperature",
          "zh": "溫濕度管理",
          "en": "Temperature & humidity",
          "g": "環境與巡檢",
          "ge": "Environment",
          "ic": "🌡"
        },
        {
          "k": "gc.cleaning",
          "zh": "清潔與 6S",
          "en": "Cleaning & 6S",
          "g": "環境與巡檢",
          "ge": "Environment",
          "ic": "🧹"
        },
        {
          "k": "gc.ehs",
          "zh": "回收與廢料",
          "en": "Recycling & waste",
          "g": "環境與巡檢",
          "ge": "Environment",
          "ic": "♻️"
        },
        {
          "k": "gc.dormitory",
          "zh": "宿舍管理",
          "en": "Dormitory",
          "g": "宿舍與資產",
          "ge": "Dorms & assets",
          "ic": "🏠"
        },
        {
          "k": "gc.asset",
          "zh": "資產設備",
          "en": "Assets",
          "g": "宿舍與資產",
          "ge": "Dorms & assets",
          "ic": "🧰"
        },
        {
          "k": "gc.keymovement",
          "zh": "鑰匙借還",
          "en": "Keys",
          "g": "宿舍與資產",
          "ge": "Dorms & assets",
          "ic": "🔑"
        },
        {
          "k": "gc.waterdrum",
          "zh": "飲用水管理",
          "en": "Drinking water",
          "g": "宿舍與資產",
          "ge": "Dorms & assets",
          "ic": "💧"
        },
        {
          "k": "exp.procurement",
          "zh": "採購中心",
          "en": "Procurement",
          "g": "採購與費用",
          "ge": "Procurement & expense",
          "ic": "🛒"
        },
        {
          "k": "exp.receiving",
          "zh": "收貨與領用",
          "en": "Receiving & issue",
          "g": "採購與費用",
          "ge": "Procurement & expense",
          "ic": "📥"
        },
        {
          "k": "exp.maintenance",
          "zh": "維修與臨採",
          "en": "Maintenance",
          "g": "採購與費用",
          "ge": "Procurement & expense",
          "ic": "🔧"
        },
        {
          "k": "exp.damage",
          "zh": "損壞與遺失",
          "en": "Damage & loss",
          "g": "採購與費用",
          "ge": "Procurement & expense",
          "ic": "💥"
        },
        {
          "k": "exp.fuel",
          "zh": "燃油管理",
          "en": "Fuel",
          "g": "採購與費用",
          "ge": "Procurement & expense",
          "ic": "⛽"
        },
        {
          "k": "exp.expense",
          "zh": "費用中心",
          "en": "Expense ledger",
          "g": "採購與費用",
          "ge": "Procurement & expense",
          "ic": "💳"
        },
        {
          "k": "exp.transportation",
          "zh": "行車紀錄",
          "en": "Vehicle journeys",
          "g": "採購與費用",
          "ge": "Procurement & expense",
          "ic": "🚐"
        },
        {
          "k": "exp.etc",
          "zh": "ETC 通行費",
          "en": "ETC tolls",
          "g": "採購與費用",
          "ge": "Procurement & expense",
          "ic": "🛣"
        },
        {
          "k": "sec.expense",
          "zh": "保安費用",
          "en": "Security expenses",
          "g": "採購與費用",
          "ge": "Procurement & expense",
          "ic": "🧾"
        }
      ],
      "tag": "GA"
    },
    {
      "id": "audit",
      "icon": "📋",
      "color": "#c2410c",
      "zh": "驗廠合規",
      "en": "Compliance",
      "km": "អនុលោមភាព",
      "sub": {
        "zh": "驗廠評鑑・文件・法規・培訓",
        "en": "Assessment · documents · law · training",
        "km": "វាយតម្លៃ · ឯកសារ · ច្បាប់"
      },
      "name": "AC Audit",
      "mode": "file",
      "url": "https://saintdou-weng.github.io/ac-audit/",
      "home": "audit_hub_main.html",
      "gas": "https://script.google.com/macros/s/AKfycbxN61TQr2S_tKxSgGKJe_yjNVpPAdu_YRw-8pByWiHDCWdJpcGNCk2c2Li1yGQdkRcB_Q/exec",
      "probe": "ping",
      "pages": [
        {
          "k": "audit_hub_main.html",
          "zh": "驗廠評鑑總覽",
          "en": "Compliance assessment",
          "g": "驗廠評鑑",
          "ge": "Assessment",
          "ic": "📋"
        },
        {
          "k": "ac_audit_platform_v1.html",
          "zh": "稽核入口",
          "en": "Audit portal",
          "g": "驗廠評鑑",
          "ge": "Assessment",
          "ic": "🧭"
        },
        {
          "k": "wse_audit_v1.html",
          "zh": "WSE 稽核",
          "en": "WSE audit",
          "g": "驗廠評鑑",
          "ge": "Assessment",
          "ic": "✅"
        },
        {
          "k": "wrap_audit_v1.html",
          "zh": "WRAP 稽核",
          "en": "WRAP audit",
          "g": "驗廠評鑑",
          "ge": "Assessment",
          "ic": "✅"
        },
        {
          "k": "WSE_BIGW_Tracker_v7_1.html",
          "zh": "BIG W / WSE 追蹤",
          "en": "BIG W / WSE tracker",
          "g": "驗廠評鑑",
          "ge": "Assessment",
          "ic": "🎯"
        },
        {
          "k": "assessment_overview.html",
          "zh": "Assessment 總覽",
          "en": "Assessment overview",
          "g": "驗廠評鑑",
          "ge": "Assessment",
          "ic": "📊"
        },
        {
          "k": "VRT_DCC_v2.html",
          "zh": "文件管控 DCC",
          "en": "Document control",
          "g": "文件與法規",
          "ge": "Documents & law",
          "ic": "🗄"
        },
        {
          "k": "MSG_Processor.html",
          "zh": "外來文件管制表",
          "en": "External documents",
          "g": "文件與法規",
          "ge": "Documents & law",
          "ic": "✉️"
        },
        {
          "k": "cambodia_law_v1.html",
          "zh": "柬埔寨法律",
          "en": "Cambodia law",
          "g": "文件與法規",
          "ge": "Documents & law",
          "ic": "⚖️"
        },
        {
          "k": "VRT_Factory_Rules_v2.html",
          "zh": "廠規手冊",
          "en": "Factory rules",
          "g": "文件與法規",
          "ge": "Documents & law",
          "ic": "📘"
        },
        {
          "k": "vrt_training_v1.html",
          "zh": "培訓計劃",
          "en": "Training plan",
          "g": "培訓與事件",
          "ge": "Training & incidents",
          "ic": "🎓"
        },
        {
          "k": "vrt_damage_report.html",
          "zh": "損壞／遺失報告",
          "en": "Damage / lost report",
          "g": "培訓與事件",
          "ge": "Training & incidents",
          "ic": "📝"
        }
      ],
      "tag": "AUDIT"
    }
  ]
};
