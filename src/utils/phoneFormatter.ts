// WhatsApp号码格式化和识别工具
// 专为外贸场景设计

import { countries, dialCodeToCountries, type CountryData } from '@/data/countries';

export interface PhoneParseResult {
  success: boolean;
  originalInput: string;
  formattedNumber: string;
  formattedNumberWithSpaces: string;
  country?: CountryData;
  possibleCountries?: CountryData[];
  error?: string;
  isValid: boolean;
  nationalNumber?: string;
  countryCode?: string;
}

export interface TimeInfo {
  currentTime: string;
  date: string;
  timezone: string;
  utcOffset: string;
  isBusinessHours: boolean;
  businessHoursStatus: string;
  dayOfWeek: string;
}

// 清理输入的号码（移除所有非数字字符，保留+号）
export function sanitizePhoneNumber(input: string): string {
  // 保留+号（如果在开头），移除其他所有非数字字符
  let cleaned = input.trim();
  
  // 处理各种常见输入格式
  // 1. 移除空格、横线、括号、点
  cleaned = cleaned.replace(/[\s\-\(\)\.]/g, '');
  
  // 2. 处理00开头的国际格式（转换为+）
  if (cleaned.startsWith('00')) {
    cleaned = '+' + cleaned.substring(2);
  }
  
  // 3. 确保+号只在开头
  if (cleaned.includes('+') && !cleaned.startsWith('+')) {
    cleaned = cleaned.replace(/\+/g, '');
  }
  
  // 4. 如果号码不以+开头，尝试智能添加
  if (!cleaned.startsWith('+')) {
    // 如果号码以0开头，可能是本地格式
    if (cleaned.startsWith('0')) {
      // 保留原样，后续会尝试识别
      cleaned = cleaned;
    }
  }
  
  return cleaned;
}

// 提取可能的区号（保留用于未来扩展）
// function extractPossibleCountryCodes(number: string): string[] {
//   const codes: string[] = [];
//   
//   // 移除+号后检查
//   const numWithoutPlus = number.startsWith('+') ? number.substring(1) : number;
//   
//   // 尝试匹配1-4位区号
//   for (let i = 1; i <= 4 && i <= numWithoutPlus.length; i++) {
//     const possibleCode = '+' + numWithoutPlus.substring(0, i);
//     if (dialCodeToCountries[possibleCode] && dialCodeToCountries[possibleCode].length > 0) {
//       codes.push(possibleCode);
//     }
//   }
//   
//   return codes;
// }

// 识别国家
export function identifyCountry(number: string): {
  country?: CountryData;
  possibleCountries: CountryData[];
  countryCode: string;
  nationalNumber: string;
} {
  const possibleCountries: CountryData[] = [];
  let matchedCountry: CountryData | undefined;
  let matchedCode = '';
  let nationalNumber = number;
  
  // 移除+号
  const numWithoutPlus = number.startsWith('+') ? number.substring(1) : number;
  
  // 尝试匹配区号（从长到短）
  for (let i = 4; i >= 1; i--) {
    if (i <= numWithoutPlus.length) {
      const possibleCode = '+' + numWithoutPlus.substring(0, i);
      const countries = dialCodeToCountries[possibleCode];
      
      if (countries && countries.length > 0) {
        possibleCountries.push(...countries);
        if (!matchedCountry) {
          matchedCountry = countries[0];
          matchedCode = possibleCode;
          nationalNumber = numWithoutPlus.substring(i);
        }
      }
    }
  }
  
  return {
    country: matchedCountry,
    possibleCountries: [...new Set(possibleCountries)],
    countryCode: matchedCode,
    nationalNumber
  };
}

// 格式化号码（带空格）
function formatWithSpaces(number: string, countryCode: string): string {
  const numWithoutPlus = number.startsWith('+') ? number.substring(1) : number;
  
  // 根据国家代码应用不同的格式化规则
  switch (countryCode) {
    case '+86': // 中国
      if (numWithoutPlus.length === 11) {
        return `+${numWithoutPlus.slice(0, 2)} ${numWithoutPlus.slice(2, 3)} ${numWithoutPlus.slice(3, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+1': // 美国/加拿大
      if (numWithoutPlus.length === 11) {
        return `+${numWithoutPlus.slice(0, 1)} ${numWithoutPlus.slice(1, 4)} ${numWithoutPlus.slice(4, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+44': // 英国
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 2)} ${numWithoutPlus.slice(2, 4)} ${numWithoutPlus.slice(4, 8)} ${numWithoutPlus.slice(8)}`;
      }
      break;
    case '+49': // 德国
      if (numWithoutPlus.length >= 11) {
        return `+${numWithoutPlus.slice(0, 2)} ${numWithoutPlus.slice(2, 4)} ${numWithoutPlus.slice(4, 8)} ${numWithoutPlus.slice(8)}`;
      }
      break;
    case '+33': // 法国
      if (numWithoutPlus.length === 11) {
        return `+${numWithoutPlus.slice(0, 2)} ${numWithoutPlus.slice(2, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 7)} ${numWithoutPlus.slice(7, 9)} ${numWithoutPlus.slice(9)}`;
      }
      break;
    case '+91': // 印度
      if (numWithoutPlus.length === 12) {
        return `+${numWithoutPlus.slice(0, 2)} ${numWithoutPlus.slice(2, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+55': // 巴西
      if (numWithoutPlus.length >= 12) {
        return `+${numWithoutPlus.slice(0, 2)} ${numWithoutPlus.slice(2, 4)} ${numWithoutPlus.slice(4, 9)} ${numWithoutPlus.slice(9)}`;
      }
      break;
    case '+7': // 俄罗斯/哈萨克斯坦
      if (numWithoutPlus.length === 11) {
        return `+${numWithoutPlus.slice(0, 1)} ${numWithoutPlus.slice(1, 4)} ${numWithoutPlus.slice(4, 7)} ${numWithoutPlus.slice(7, 9)} ${numWithoutPlus.slice(9)}`;
      }
      break;
    case '+81': // 日本
      if (numWithoutPlus.length === 11) {
        return `+${numWithoutPlus.slice(0, 2)} ${numWithoutPlus.slice(2, 3)} ${numWithoutPlus.slice(3, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+82': // 韩国
      if (numWithoutPlus.length === 11) {
        return `+${numWithoutPlus.slice(0, 2)} ${numWithoutPlus.slice(2, 3)} ${numWithoutPlus.slice(3, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+65': // 新加坡
      return `+${numWithoutPlus.slice(0, 2)} ${numWithoutPlus.slice(2, 6)} ${numWithoutPlus.slice(6)}`;
    case '+62': // 印尼
      if (numWithoutPlus.length >= 11) {
        return `+${numWithoutPlus.slice(0, 2)} ${numWithoutPlus.slice(2, 4)} ${numWithoutPlus.slice(4, 8)} ${numWithoutPlus.slice(8)}`;
      }
      break;
    case '+60': // 马来西亚
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 2)} ${numWithoutPlus.slice(2, 4)} ${numWithoutPlus.slice(4, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+66': // 泰国
      if (numWithoutPlus.length >= 9) {
        return `+${numWithoutPlus.slice(0, 2)} ${numWithoutPlus.slice(2, 3)} ${numWithoutPlus.slice(3, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+84': // 越南
      if (numWithoutPlus.length >= 9) {
        return `+${numWithoutPlus.slice(0, 2)} ${numWithoutPlus.slice(2, 3)} ${numWithoutPlus.slice(3, 6)} ${numWithoutPlus.slice(6)}`;
      }
      break;
    case '+63': // 菲律宾
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 2)} ${numWithoutPlus.slice(2, 5)} ${numWithoutPlus.slice(5, 8)} ${numWithoutPlus.slice(8)}`;
      }
      break;
    case '+971': // 阿联酋
      if (numWithoutPlus.length >= 11) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 4)} ${numWithoutPlus.slice(4, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+966': // 沙特
      if (numWithoutPlus.length >= 11) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 4)} ${numWithoutPlus.slice(4, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+90': // 土耳其
      if (numWithoutPlus.length >= 11) {
        return `+${numWithoutPlus.slice(0, 2)} ${numWithoutPlus.slice(2, 3)} ${numWithoutPlus.slice(3, 6)} ${numWithoutPlus.slice(6, 8)} ${numWithoutPlus.slice(8)}`;
      }
      break;
    case '+39': // 意大利
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 2)} ${numWithoutPlus.slice(2, 3)} ${numWithoutPlus.slice(3, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+34': // 西班牙
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 2)} ${numWithoutPlus.slice(2, 3)} ${numWithoutPlus.slice(3, 6)} ${numWithoutPlus.slice(6, 8)} ${numWithoutPlus.slice(8)}`;
      }
      break;
    case '+31': // 荷兰
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 2)} ${numWithoutPlus.slice(2, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 8)} ${numWithoutPlus.slice(8)}`;
      }
      break;
    case '+41': // 瑞士
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 2)} ${numWithoutPlus.slice(2, 4)} ${numWithoutPlus.slice(4, 7)} ${numWithoutPlus.slice(7, 9)} ${numWithoutPlus.slice(9)}`;
      }
      break;
    case '+46': // 瑞典
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 2)} ${numWithoutPlus.slice(2, 4)} ${numWithoutPlus.slice(4, 7)} ${numWithoutPlus.slice(7, 9)} ${numWithoutPlus.slice(9)}`;
      }
      break;
    case '+47': // 挪威
      if (numWithoutPlus.length >= 9) {
        return `+${numWithoutPlus.slice(0, 2)} ${numWithoutPlus.slice(2, 4)} ${numWithoutPlus.slice(4, 6)} ${numWithoutPlus.slice(6, 8)} ${numWithoutPlus.slice(8)}`;
      }
      break;
    case '+45': // 丹麦
      return `+${numWithoutPlus.slice(0, 2)} ${numWithoutPlus.slice(2, 4)} ${numWithoutPlus.slice(4, 6)} ${numWithoutPlus.slice(6, 8)} ${numWithoutPlus.slice(8)}`;
    case '+358': // 芬兰
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 4)} ${numWithoutPlus.slice(4, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+27': // 南非
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 2)} ${numWithoutPlus.slice(2, 4)} ${numWithoutPlus.slice(4, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+20': // 埃及
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 2)} ${numWithoutPlus.slice(2, 3)} ${numWithoutPlus.slice(3, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+234': // 尼日利亚
      if (numWithoutPlus.length >= 11) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 4)} ${numWithoutPlus.slice(4, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+254': // 肯尼亚
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 4)} ${numWithoutPlus.slice(4, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+61': // 澳大利亚
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 2)} ${numWithoutPlus.slice(2, 3)} ${numWithoutPlus.slice(3, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+64': // 新西兰
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 2)} ${numWithoutPlus.slice(2, 4)} ${numWithoutPlus.slice(4, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+52': // 墨西哥
      if (numWithoutPlus.length >= 11) {
        return `+${numWithoutPlus.slice(0, 2)} ${numWithoutPlus.slice(2, 3)} ${numWithoutPlus.slice(3, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+54': // 阿根廷
      if (numWithoutPlus.length >= 11) {
        return `+${numWithoutPlus.slice(0, 2)} ${numWithoutPlus.slice(2, 4)} ${numWithoutPlus.slice(4, 6)} ${numWithoutPlus.slice(6, 10)} ${numWithoutPlus.slice(10)}`;
      }
      break;
    case '+57': // 哥伦比亚
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 2)} ${numWithoutPlus.slice(2, 5)} ${numWithoutPlus.slice(5, 8)} ${numWithoutPlus.slice(8)}`;
      }
      break;
    case '+880': // 孟加拉
      if (numWithoutPlus.length >= 11) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 9)} ${numWithoutPlus.slice(9)}`;
      }
      break;
    case '+92': // 巴基斯坦
      if (numWithoutPlus.length >= 11) {
        return `+${numWithoutPlus.slice(0, 2)} ${numWithoutPlus.slice(2, 4)} ${numWithoutPlus.slice(4, 11)}`;
      }
      break;
    case '+94': // 斯里兰卡
      if (numWithoutPlus.length >= 9) {
        return `+${numWithoutPlus.slice(0, 2)} ${numWithoutPlus.slice(2, 3)} ${numWithoutPlus.slice(3, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+95': // 缅甸
      if (numWithoutPlus.length >= 9) {
        return `+${numWithoutPlus.slice(0, 2)} ${numWithoutPlus.slice(2, 3)} ${numWithoutPlus.slice(3, 6)} ${numWithoutPlus.slice(6)}`;
      }
      break;
    case '+855': // 柬埔寨
      if (numWithoutPlus.length >= 9) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 8)} ${numWithoutPlus.slice(8)}`;
      }
      break;
    case '+856': // 老挝
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 8)} ${numWithoutPlus.slice(8)}`;
      }
      break;
    case '+853': // 澳门
      return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 7)} ${numWithoutPlus.slice(7)}`;
    case '+852': // 香港
      return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 7)} ${numWithoutPlus.slice(7)}`;
    case '+886': // 台湾
      if (numWithoutPlus.length >= 9) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 4)} ${numWithoutPlus.slice(4, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+850': // 朝鲜
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 9)} ${numWithoutPlus.slice(9)}`;
      }
      break;
    case '+976': // 蒙古
      if (numWithoutPlus.length >= 8) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 6)} ${numWithoutPlus.slice(6)}`;
      }
      break;
    case '+673': // 文莱
      return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 6)} ${numWithoutPlus.slice(6)}`;
    case '+670': // 东帝汶
      return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 7)} ${numWithoutPlus.slice(7)}`;
    case '+93': // 阿富汗
      if (numWithoutPlus.length >= 9) {
        return `+${numWithoutPlus.slice(0, 2)} ${numWithoutPlus.slice(2, 4)} ${numWithoutPlus.slice(4, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+964': // 伊拉克
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 4)} ${numWithoutPlus.slice(4, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+972': // 以色列
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 4)} ${numWithoutPlus.slice(4, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+974': // 卡塔尔
      return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 7)} ${numWithoutPlus.slice(7)}`;
    case '+965': // 科威特
      return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 7)} ${numWithoutPlus.slice(7)}`;
    case '+973': // 巴林
      return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 7)} ${numWithoutPlus.slice(7)}`;
    case '+968': // 阿曼
      return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 7)} ${numWithoutPlus.slice(7)}`;
    case '+967': // 也门
      if (numWithoutPlus.length >= 9) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 6)} ${numWithoutPlus.slice(6, 9)}`;
      }
      break;
    case '+962': // 约旦
      if (numWithoutPlus.length >= 9) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 4)} ${numWithoutPlus.slice(4, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+961': // 黎巴嫩
      if (numWithoutPlus.length >= 8) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 4)} ${numWithoutPlus.slice(4, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+963': // 叙利亚
      if (numWithoutPlus.length >= 9) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 4)} ${numWithoutPlus.slice(4, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+994': // 阿塞拜疆
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 8)} ${numWithoutPlus.slice(8)}`;
      }
      break;
    case '+374': // 亚美尼亚
      if (numWithoutPlus.length >= 9) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 8)} ${numWithoutPlus.slice(8)}`;
      }
      break;
    case '+995': // 格鲁吉亚
      if (numWithoutPlus.length >= 11) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 6)} ${numWithoutPlus.slice(6, 9)} ${numWithoutPlus.slice(9)}`;
      }
      break;
    case '+213': // 阿尔及利亚
      if (numWithoutPlus.length >= 11) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 7)} ${numWithoutPlus.slice(7, 9)} ${numWithoutPlus.slice(9)}`;
      }
      break;
    case '+212': // 摩洛哥
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 8)} ${numWithoutPlus.slice(8)}`;
      }
      break;
    case '+218': // 利比亚
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 4)} ${numWithoutPlus.slice(4, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+216': // 突尼斯
      if (numWithoutPlus.length >= 8) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 8)}`;
      }
      break;
    case '+249': // 苏丹
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 4)} ${numWithoutPlus.slice(4, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+222': // 毛里塔尼亚
      if (numWithoutPlus.length >= 8) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+233': // 加纳
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 8)} ${numWithoutPlus.slice(8)}`;
      }
      break;
    case '+225': // 科特迪瓦
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 7)} ${numWithoutPlus.slice(7, 9)} ${numWithoutPlus.slice(9)}`;
      }
      break;
    case '+221': // 塞内加尔
      if (numWithoutPlus.length >= 9) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 8)} ${numWithoutPlus.slice(8)}`;
      }
      break;
    case '+223': // 马里
      if (numWithoutPlus.length >= 8) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+226': // 布基纳法索
      if (numWithoutPlus.length >= 8) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+227': // 尼日尔
      if (numWithoutPlus.length >= 8) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+224': // 几内亚
      if (numWithoutPlus.length >= 9) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+232': // 塞拉利昂
      if (numWithoutPlus.length >= 8) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 8)}`;
      }
      break;
    case '+231': // 利比里亚
      if (numWithoutPlus.length >= 9) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 8)} ${numWithoutPlus.slice(8)}`;
      }
      break;
    case '+220': // 冈比亚
      return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 6)} ${numWithoutPlus.slice(6)}`;
    case '+245': // 几内亚比绍
      return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 6)} ${numWithoutPlus.slice(6)}`;
    case '+228': // 多哥
      if (numWithoutPlus.length >= 8) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+229': // 贝宁
      if (numWithoutPlus.length >= 8) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+251': // 埃塞俄比亚
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 8)} ${numWithoutPlus.slice(8)}`;
      }
      break;
    case '+255': // 坦桑尼亚
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 8)} ${numWithoutPlus.slice(8)}`;
      }
      break;
    case '+256': // 乌干达
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 8)} ${numWithoutPlus.slice(8)}`;
      }
      break;
    case '+250': // 卢旺达
      if (numWithoutPlus.length >= 9) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 8)} ${numWithoutPlus.slice(8)}`;
      }
      break;
    case '+257': // 布隆迪
      if (numWithoutPlus.length >= 8) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+252': // 索马里
      if (numWithoutPlus.length >= 9) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 4)} ${numWithoutPlus.slice(4, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+253': // 吉布提
      if (numWithoutPlus.length >= 8) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+291': // 厄立特里亚
      if (numWithoutPlus.length >= 7) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 4)} ${numWithoutPlus.slice(4, 7)}`;
      }
      break;
    case '+211': // 南苏丹
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 8)} ${numWithoutPlus.slice(8)}`;
      }
      break;
    case '+243': // 刚果民主共和国
      if (numWithoutPlus.length >= 11) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 8)} ${numWithoutPlus.slice(8)}`;
      }
      break;
    case '+242': // 刚果共和国
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 8)} ${numWithoutPlus.slice(8)}`;
      }
      break;
    case '+237': // 喀麦隆
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 4)} ${numWithoutPlus.slice(4, 6)} ${numWithoutPlus.slice(6, 8)} ${numWithoutPlus.slice(8)}`;
      }
      break;
    case '+235': // 乍得
      if (numWithoutPlus.length >= 8) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+236': // 中非共和国
      if (numWithoutPlus.length >= 8) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+241': // 加蓬
      if (numWithoutPlus.length >= 8) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+240': // 赤道几内亚
      if (numWithoutPlus.length >= 9) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 6)} ${numWithoutPlus.slice(6, 9)}`;
      }
      break;
    case '+239': // 圣多美和普林西比
      if (numWithoutPlus.length >= 7) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+244': // 安哥拉
      if (numWithoutPlus.length >= 9) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 8)} ${numWithoutPlus.slice(8)}`;
      }
      break;
    case '+260': // 赞比亚
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 8)} ${numWithoutPlus.slice(8)}`;
      }
      break;
    case '+263': // 津巴布韦
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 8)} ${numWithoutPlus.slice(8)}`;
      }
      break;
    case '+258': // 莫桑比克
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 8)} ${numWithoutPlus.slice(8)}`;
      }
      break;
    case '+267': // 博茨瓦纳
      if (numWithoutPlus.length >= 9) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+264': // 纳米比亚
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 8)} ${numWithoutPlus.slice(8)}`;
      }
      break;
    case '+268': // 斯威士兰
      if (numWithoutPlus.length >= 8) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+266': // 莱索托
      if (numWithoutPlus.length >= 8) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+261': // 马达加斯加
      if (numWithoutPlus.length >= 9) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 7)} ${numWithoutPlus.slice(7, 9)} ${numWithoutPlus.slice(9)}`;
      }
      break;
    case '+230': // 毛里求斯
      return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 6)} ${numWithoutPlus.slice(6)}`;
    case '+269': // 科摩罗
      if (numWithoutPlus.length >= 7) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 7)}`;
      }
      break;
    case '+248': // 塞舌尔
      if (numWithoutPlus.length >= 7) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 4)} ${numWithoutPlus.slice(4, 7)}`;
      }
      break;
    case '+679': // 斐济
      return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 6)} ${numWithoutPlus.slice(6)}`;
    case '+675': // 巴布亚新几内亚
      return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 6)} ${numWithoutPlus.slice(6)}`;
    case '+677': // 所罗门群岛
      return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 6)} ${numWithoutPlus.slice(6)}`;
    case '+678': // 瓦努阿图
      return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 6)} ${numWithoutPlus.slice(6)}`;
    case '+685': // 萨摩亚
      if (numWithoutPlus.length >= 7) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+676': // 汤加
      return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 6)} ${numWithoutPlus.slice(6)}`;
    case '+686': // 基里巴斯
      return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 6)} ${numWithoutPlus.slice(6)}`;
    case '+688': // 图瓦卢
      return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 6)} ${numWithoutPlus.slice(6)}`;
    case '+674': // 瑙鲁
      return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 6)} ${numWithoutPlus.slice(6)}`;
    case '+680': // 帕劳
      return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 6)} ${numWithoutPlus.slice(6)}`;
    case '+692': // 马绍尔群岛
      return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 6)} ${numWithoutPlus.slice(6)}`;
    case '+691': // 密克罗尼西亚
      return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 6)} ${numWithoutPlus.slice(6)}`;
    case '+1-876': // 牙买加
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 1)} ${numWithoutPlus.slice(1, 4)} ${numWithoutPlus.slice(4, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+509': // 海地
      if (numWithoutPlus.length >= 8) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 8)}`;
      }
      break;
    case '+1-809': // 多米尼加
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 1)} ${numWithoutPlus.slice(1, 4)} ${numWithoutPlus.slice(4, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+1-868': // 特立尼达和多巴哥
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 1)} ${numWithoutPlus.slice(1, 4)} ${numWithoutPlus.slice(4, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+1-246': // 巴巴多斯
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 1)} ${numWithoutPlus.slice(1, 4)} ${numWithoutPlus.slice(4, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+1-242': // 巴哈马
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 1)} ${numWithoutPlus.slice(1, 4)} ${numWithoutPlus.slice(4, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+1-787': // 波多黎各
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 1)} ${numWithoutPlus.slice(1, 4)} ${numWithoutPlus.slice(4, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+1-268': // 安提瓜和巴布达
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 1)} ${numWithoutPlus.slice(1, 4)} ${numWithoutPlus.slice(4, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+1-767': // 多米尼克
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 1)} ${numWithoutPlus.slice(1, 4)} ${numWithoutPlus.slice(4, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+1-473': // 格林纳达
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 1)} ${numWithoutPlus.slice(1, 4)} ${numWithoutPlus.slice(4, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+1-869': // 圣基茨和尼维斯
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 1)} ${numWithoutPlus.slice(1, 4)} ${numWithoutPlus.slice(4, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+1-758': // 圣卢西亚
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 1)} ${numWithoutPlus.slice(1, 4)} ${numWithoutPlus.slice(4, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+1-784': // 圣文森特和格林纳丁斯
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 1)} ${numWithoutPlus.slice(1, 4)} ${numWithoutPlus.slice(4, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+297': // 阿鲁巴
      return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 6)} ${numWithoutPlus.slice(6)}`;
    case '+599': // 库拉索
      if (numWithoutPlus.length >= 9) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 8)} ${numWithoutPlus.slice(8)}`;
      }
      break;
    case '+1-721': // 荷属圣马丁
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 1)} ${numWithoutPlus.slice(1, 4)} ${numWithoutPlus.slice(4, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+1-345': // 开曼群岛
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 1)} ${numWithoutPlus.slice(1, 4)} ${numWithoutPlus.slice(4, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+1-441': // 百慕大
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 1)} ${numWithoutPlus.slice(1, 4)} ${numWithoutPlus.slice(4, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+1-284': // 英属维尔京群岛
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 1)} ${numWithoutPlus.slice(1, 4)} ${numWithoutPlus.slice(4, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+1-649': // 特克斯和凯科斯群岛
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 1)} ${numWithoutPlus.slice(1, 4)} ${numWithoutPlus.slice(4, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+998': // 乌兹别克斯坦
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 8)} ${numWithoutPlus.slice(8)}`;
      }
      break;
    case '+996': // 吉尔吉斯斯坦
      if (numWithoutPlus.length >= 9) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 8)} ${numWithoutPlus.slice(8)}`;
      }
      break;
    case '+992': // 塔吉克斯坦
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 8)} ${numWithoutPlus.slice(8)}`;
      }
      break;
    case '+993': // 土库曼斯坦
      if (numWithoutPlus.length >= 9) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 4)} ${numWithoutPlus.slice(4, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+53': // 古巴
      if (numWithoutPlus.length >= 8) {
        return `+${numWithoutPlus.slice(0, 2)} ${numWithoutPlus.slice(2, 3)} ${numWithoutPlus.slice(3, 7)}`;
      }
      break;
    case '+502': // 危地马拉
      return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 7)} ${numWithoutPlus.slice(7)}`;
    case '+501': // 伯利兹
      return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 6)} ${numWithoutPlus.slice(6)}`;
    case '+503': // 萨尔瓦多
      return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 7)} ${numWithoutPlus.slice(7)}`;
    case '+504': // 洪都拉斯
      return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 7)} ${numWithoutPlus.slice(7)}`;
    case '+505': // 尼加拉瓜
      return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 7)} ${numWithoutPlus.slice(7)}`;
    case '+506': // 哥斯达黎加
      return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 7)} ${numWithoutPlus.slice(7)}`;
    case '+507': // 巴拿马
      return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 7)} ${numWithoutPlus.slice(7)}`;
    case '+51': // 秘鲁
      if (numWithoutPlus.length >= 9) {
        return `+${numWithoutPlus.slice(0, 2)} ${numWithoutPlus.slice(2, 3)} ${numWithoutPlus.slice(3, 6)} ${numWithoutPlus.slice(6)}`;
      }
      break;
    case '+58': // 委内瑞拉
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 2)} ${numWithoutPlus.slice(2, 4)} ${numWithoutPlus.slice(4, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+56': // 智利
      if (numWithoutPlus.length >= 9) {
        return `+${numWithoutPlus.slice(0, 2)} ${numWithoutPlus.slice(2, 3)} ${numWithoutPlus.slice(3, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+593': // 厄瓜多尔
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 4)} ${numWithoutPlus.slice(4, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+591': // 玻利维亚
      if (numWithoutPlus.length >= 8) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 8)}`;
      }
      break;
    case '+595': // 巴拉圭
      if (numWithoutPlus.length >= 9) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 8)} ${numWithoutPlus.slice(8)}`;
      }
      break;
    case '+598': // 乌拉圭
      if (numWithoutPlus.length >= 9) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 8)} ${numWithoutPlus.slice(8)}`;
      }
      break;
    case '+592': // 圭亚那
      return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 6)} ${numWithoutPlus.slice(6)}`;
    case '+597': // 苏里南
      return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 6)} ${numWithoutPlus.slice(6)}`;
    case '+48': // 波兰
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 2)} ${numWithoutPlus.slice(2, 5)} ${numWithoutPlus.slice(5, 8)} ${numWithoutPlus.slice(8)}`;
      }
      break;
    case '+380': // 乌克兰
      if (numWithoutPlus.length >= 11) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 8)} ${numWithoutPlus.slice(8)}`;
      }
      break;
    case '+420': // 捷克
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 8)} ${numWithoutPlus.slice(8)}`;
      }
      break;
    case '+36': // 匈牙利
      if (numWithoutPlus.length >= 9) {
        return `+${numWithoutPlus.slice(0, 2)} ${numWithoutPlus.slice(2, 4)} ${numWithoutPlus.slice(4, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+40': // 罗马尼亚
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 2)} ${numWithoutPlus.slice(2, 4)} ${numWithoutPlus.slice(4, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+359': // 保加利亚
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 8)} ${numWithoutPlus.slice(8)}`;
      }
      break;
    case '+375': // 白俄罗斯
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 8)} ${numWithoutPlus.slice(8)}`;
      }
      break;
    case '+373': // 摩尔多瓦
      if (numWithoutPlus.length >= 8) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+421': // 斯洛伐克
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 8)} ${numWithoutPlus.slice(8)}`;
      }
      break;
    case '+370': // 立陶宛
      if (numWithoutPlus.length >= 9) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 8)}`;
      }
      break;
    case '+371': // 拉脱维亚
      if (numWithoutPlus.length >= 8) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+372': // 爱沙尼亚
      if (numWithoutPlus.length >= 9) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 8)} ${numWithoutPlus.slice(8)}`;
      }
      break;
    case '+30': // 希腊
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 2)} ${numWithoutPlus.slice(2, 4)} ${numWithoutPlus.slice(4, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+385': // 克罗地亚
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 8)} ${numWithoutPlus.slice(8)}`;
      }
      break;
    case '+381': // 塞尔维亚
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 8)} ${numWithoutPlus.slice(8)}`;
      }
      break;
    case '+386': // 斯洛文尼亚
      if (numWithoutPlus.length >= 9) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 8)}`;
      }
      break;
    case '+387': // 波黑
      if (numWithoutPlus.length >= 9) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+389': // 北马其顿
      if (numWithoutPlus.length >= 9) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+382': // 黑山
      if (numWithoutPlus.length >= 9) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+355': // 阿尔巴尼亚
      if (numWithoutPlus.length >= 9) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+356': // 马耳他
      return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 6)} ${numWithoutPlus.slice(6)}`;
    case '+357': // 塞浦路斯
      if (numWithoutPlus.length >= 8) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 8)}`;
      }
      break;
    case '+32': // 比利时
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 2)} ${numWithoutPlus.slice(2, 4)} ${numWithoutPlus.slice(4, 6)} ${numWithoutPlus.slice(6, 8)} ${numWithoutPlus.slice(8)}`;
      }
      break;
    case '+43': // 奥地利
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 2)} ${numWithoutPlus.slice(2, 4)} ${numWithoutPlus.slice(4, 8)} ${numWithoutPlus.slice(8)}`;
      }
      break;
    case '+353': // 爱尔兰
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 8)} ${numWithoutPlus.slice(8)}`;
      }
      break;
    case '+351': // 葡萄牙
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 4)} ${numWithoutPlus.slice(4, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+352': // 卢森堡
      if (numWithoutPlus.length >= 9) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 8)} ${numWithoutPlus.slice(8)}`;
      }
      break;
    case '+377': // 摩纳哥
      if (numWithoutPlus.length >= 8) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+423': // 列支敦士登
      if (numWithoutPlus.length >= 7) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+98': // 伊朗
      if (numWithoutPlus.length >= 11) {
        return `+${numWithoutPlus.slice(0, 2)} ${numWithoutPlus.slice(2, 4)} ${numWithoutPlus.slice(4, 7)} ${numWithoutPlus.slice(7)}`;
      }
      break;
    case '+977': // 尼泊尔
      if (numWithoutPlus.length >= 10) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 5)} ${numWithoutPlus.slice(5, 8)} ${numWithoutPlus.slice(8)}`;
      }
      break;
    case '+975': // 不丹
      if (numWithoutPlus.length >= 8) {
        return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 4)} ${numWithoutPlus.slice(4, 6)} ${numWithoutPlus.slice(6, 8)}`;
      }
      break;
    case '+960': // 马尔代夫
      return `+${numWithoutPlus.slice(0, 3)} ${numWithoutPlus.slice(3, 6)} ${numWithoutPlus.slice(6)}`;
    default:
      // 通用格式：每3-4位分组
      if (numWithoutPlus.length > 4) {
        const groups: string[] = [];
        let i = 0;
        while (i < numWithoutPlus.length) {
          if (i === 0) {
            groups.push(numWithoutPlus.slice(i, i + Math.min(3, numWithoutPlus.length - i)));
            i += 3;
          } else {
            groups.push(numWithoutPlus.slice(i, i + Math.min(4, numWithoutPlus.length - i)));
            i += 4;
          }
        }
        return '+' + groups.join(' ');
      }
  }
  
  return '+' + numWithoutPlus;
}

// 主解析函数
export function parsePhoneNumber(input: string): PhoneParseResult {
  if (!input || input.trim() === '') {
    return {
      success: false,
      originalInput: input,
      formattedNumber: '',
      formattedNumberWithSpaces: '',
      error: '请输入电话号码',
      isValid: false
    };
  }

  const originalInput = input.trim();
  
  // 清理号码
  let cleaned = sanitizePhoneNumber(originalInput);
  
  // 如果没有+号，尝试智能识别
  if (!cleaned.startsWith('+')) {
    // 如果号码以0开头，可能是本地格式
    if (cleaned.startsWith('0')) {
      return {
        success: false,
        originalInput,
        formattedNumber: cleaned,
        formattedNumberWithSpaces: cleaned,
        error: '号码缺少国家代码，请补充（如+86、+1等）',
        isValid: false
      };
    }
    
    // 尝试识别是否为带区号的格式
    const { country, countryCode, nationalNumber } = identifyCountry('+' + cleaned);
    
    if (country) {
      cleaned = countryCode + nationalNumber;
    }
  }
  
  // 识别国家
  const { country, possibleCountries, countryCode, nationalNumber } = identifyCountry(cleaned);
  
  if (!country) {
    return {
      success: false,
      originalInput,
      formattedNumber: cleaned,
      formattedNumberWithSpaces: cleaned,
      error: '无法识别国家代码，请检查号码格式',
      isValid: false
    };
  }
  
  // 格式化号码
  const formattedWithSpaces = formatWithSpaces(cleaned, countryCode);
  
  return {
    success: true,
    originalInput,
    formattedNumber: cleaned,
    formattedNumberWithSpaces: formattedWithSpaces,
    country,
    possibleCountries: possibleCountries.length > 1 ? possibleCountries : undefined,
    isValid: true,
    nationalNumber,
    countryCode
  };
}

// 获取当前时间信息
export function getTimeInfo(timezone: string): TimeInfo {
  try {
    const now = new Date();
    
    // 获取时区时间
    const timeFormatter = new Intl.DateTimeFormat('zh-CN', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    const dateFormatter = new Intl.DateTimeFormat('zh-CN', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'long'
    });
    
    const timeStr = timeFormatter.format(now);
    const dateStr = dateFormatter.format(now);
    
    // 计算UTC偏移
    const utcFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'shortOffset'
    });
    const utcStr = utcFormatter.format(now);
    const offsetMatch = utcStr.match(/GMT([+-]\d+)/);
    const utcOffset = offsetMatch ? offsetMatch[1] : '+0';
    
    // 判断工作时间（9:00-18:00）
    const hour = parseInt(timeStr.split(':')[0]);
    const isBusinessHours = hour >= 9 && hour < 18;
    const dayOfWeek = dateStr.split(' ')[0];
    const isWeekend = dayOfWeek === '星期六' || dayOfWeek === '星期日';
    
    let businessHoursStatus: string;
    if (isWeekend) {
      businessHoursStatus = '周末休息';
    } else if (isBusinessHours) {
      businessHoursStatus = '工作时间 ✅';
    } else if (hour < 9) {
      businessHoursStatus = '尚未上班';
    } else {
      businessHoursStatus = '已下班';
    }
    
    return {
      currentTime: timeStr,
      date: dateStr,
      timezone,
      utcOffset: `UTC${utcOffset}`,
      isBusinessHours: isBusinessHours && !isWeekend,
      businessHoursStatus,
      dayOfWeek
    };
  } catch (error) {
    return {
      currentTime: '获取失败',
      date: '获取失败',
      timezone,
      utcOffset: '未知',
      isBusinessHours: false,
      businessHoursStatus: '无法确定',
      dayOfWeek: '未知'
    };
  }
}

// 生成WhatsApp链接
export function generateWhatsAppLink(phoneNumber: string, message?: string): string {
  const cleaned = phoneNumber.replace(/\+/g, '').replace(/\s/g, '');
  const baseUrl = 'https://wa.me/';
  const url = message 
    ? `${baseUrl}${cleaned}?text=${encodeURIComponent(message)}`
    : `${baseUrl}${cleaned}`;
  return url;
}

// 复制到剪贴板
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('复制失败:', err);
    return false;
  }
}

// 验证号码长度是否合理
export function isValidLength(phoneNumber: string, countryCode?: string): boolean {
  const numWithoutCode = phoneNumber.replace(/^\+/, '').replace(countryCode?.replace('+', '') || '', '');
  
  // 大多数国家的手机号码长度在7-12位之间
  if (numWithoutCode.length < 7 || numWithoutCode.length > 12) {
    return false;
  }
  
  return true;
}

// 获取常用国家列表（外贸常用）
export function getCommonCountries(): CountryData[] {
  const commonCodes = [
    '+86', '+1', '+44', '+49', '+33', '+39', '+34', '+31', '+41', '+46',
    '+81', '+82', '+65', '+60', '+62', '+66', '+84', '+63', '+91', '+92',
    '+880', '+94', '+971', '+966', '+20', '+27', '+234', '+254', '+61',
    '+64', '+55', '+54', '+52', '+7', '+90', '+98', '+964', '+972'
  ];
  
  return commonCodes
    .map(code => countries.find(c => c.dialCode === code))
    .filter((country): country is CountryData => country !== undefined);
}

// 搜索国家
export function searchCountries(query: string): CountryData[] {
  if (!query || query.trim() === '') {
    return [];
  }
  
  const lowerQuery = query.toLowerCase().trim();
  
  return countries.filter(country => {
    return (
      country.name.toLowerCase().includes(lowerQuery) ||
      country.nameEn.toLowerCase().includes(lowerQuery) ||
      country.dialCode.includes(lowerQuery) ||
      country.code.toLowerCase().includes(lowerQuery)
    );
  });
}

// 按地区获取国家
export function getCountriesByRegion(region: string): CountryData[] {
  return countries.filter(country => country.region === region);
}
