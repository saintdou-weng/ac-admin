window.AC_CONFIG = {
  "appName": "AC Admin Center",
  "version": "1.3.0",
  "repo": "ac-admin",
  "gasProject": "AC_ADMIN_CENTER",
  "telegramBot": "ac_admin_center_bot",
  "platformOwner": "saintdou-weng",
  "platforms": [
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
      "url": "https://saintdou-weng.github.io/vrt-acc-flow-cost/index.html",
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
            "zh": "人工成本",
            "en": "Labour cost",
            "km": "ថ្លៃពលកម្ម"
          },
          "url": "https://saintdou-weng.github.io/vrt-acc-flow-cost/modules/salary-management.html"
        },
        {
          "label": {
            "zh": "工廠地圖",
            "en": "Factory map",
            "km": "ផែនទីរោងចក្រ"
          },
          "url": "https://saintdou-weng.github.io/vrt-acc-flow-cost/factory-map.html"
        }
      ],
      "source": "Repository source checked 2026-09-06"
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
  "verifiedAt": "2026-09-13",
  "timezone": "Asia/Phnom_Penh",
  "hubUrl": "https://script.google.com/macros/s/AKfycbyEWtDE39lzCC_qAIyXNTojWOHlAJj35hnBcj3ayePtJOBhG_zydaQ60AaI2NkMCyo2/exec",
  "authMode": "google-owner"
};
