import { useState, useEffect, useCallback } from 'react';
import { 
  parsePhoneNumber, 
  getTimeInfo, 
  generateWhatsAppLink,
  copyToClipboard,
  searchCountries,
  getCommonCountries,
  type PhoneParseResult
} from '@/utils/phoneFormatter';
import type { CountryData } from '@/data/countries';
import { 
  Search, 
  Copy, 
  Check, 
  Globe, 
  Clock, 
  MapPin, 
  Languages, 
  MessageCircle,
  Phone,
  Building2,
  DollarSign,
  Info,
  History,
  X,
  ChevronDown,
  ChevronUp,
  Star,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface QueryHistory {
  id: string;
  input: string;
  result: PhoneParseResult;
  timestamp: number;
}

export function PhoneQuery() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<PhoneParseResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<QueryHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CountryData[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [commonCountries] = useState<CountryData[]>(getCommonCountries());
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);

  // 加载历史记录
  useEffect(() => {
    const saved = localStorage.getItem('whatsapp-query-history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse history:', e);
      }
    }
  }, []);

  // 保存历史记录
  useEffect(() => {
    localStorage.setItem('whatsapp-query-history', JSON.stringify(history));
  }, [history]);

  // 搜索国家
  useEffect(() => {
    if (searchQuery.trim()) {
      const results = searchCountries(searchQuery);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleQuery = useCallback(() => {
    if (!input.trim()) {
      toast.error('请输入电话号码');
      return;
    }

    setLoading(true);
    
    // 模拟处理延迟
    setTimeout(() => {
      const parseResult = parsePhoneNumber(input);
      setResult(parseResult);
      
      if (parseResult.success) {
        // 添加到历史记录
        const newEntry: QueryHistory = {
          id: Date.now().toString(),
          input: input.trim(),
          result: parseResult,
          timestamp: Date.now()
        };
        setHistory(prev => [newEntry, ...prev.slice(0, 49)]); // 保留最近50条
        toast.success('号码解析成功！');
      } else {
        toast.error(parseResult.error || '解析失败');
      }
      
      setLoading(false);
    }, 300);
  }, [input]);

  const handleCopy = useCallback(async (text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      toast.success('已复制到剪贴板');
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('复制失败');
    }
  }, []);

  const handleClearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem('whatsapp-query-history');
    toast.success('历史记录已清空');
  }, []);

  const handleDeleteHistoryItem = useCallback((id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  }, []);

  const handleUseHistory = useCallback((item: QueryHistory) => {
    setInput(item.input);
    setResult(item.result);
    toast.info('已加载历史记录');
  }, []);

  const handleCountryClick = useCallback((country: CountryData) => {
    setSelectedCountry(country);
    setShowSearch(false);
    setSearchQuery('');
  }, []);

  const timeInfo = result?.country ? getTimeInfo(result.country.timezone) : null;
  const whatsappLink = result?.formattedNumber ? generateWhatsAppLink(result.formattedNumber) : '';

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      {/* 标题区域 */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 flex items-center justify-center gap-3">
          <MessageCircle className="w-8 h-8 md:w-10 md:h-10 text-green-600" />
          WhatsApp外贸号码查询系统
        </h1>
        <p className="text-slate-600 text-sm md:text-base">
          智能格式化 · 国家识别 · 时区查询 · 一键添加
        </p>
      </div>

      {/* 主查询区域 */}
      <Card className="shadow-lg border-slate-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Phone className="w-5 h-5 text-blue-600" />
            号码查询
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 输入框 */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="输入WhatsApp号码（如：+8613812345678 或 13812345678）"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
                className="pl-10 h-12 text-base"
              />
            </div>
            <Button 
              onClick={handleQuery}
              disabled={loading}
              className="h-12 px-8 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? '查询中...' : '查询'}
            </Button>
          </div>

          {/* 快速选择常用国家 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500 flex items-center gap-1">
                <Star className="w-4 h-4" />
                常用国家/地区
              </span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowSearch(!showSearch)}
              >
                {showSearch ? '隐藏搜索' : '搜索更多'}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {commonCountries.slice(0, 15).map(country => (
                <button
                  key={country.code}
                  onClick={() => handleCountryClick(country)}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <span>{country.flag}</span>
                  <span>{country.name}</span>
                  <span className="text-slate-500">{country.dialCode}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 国家搜索 */}
          {showSearch && (
            <div className="space-y-2 p-3 bg-slate-50 rounded-lg">
              <Input
                placeholder="搜索国家名称或区号..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white"
              />
              {searchResults.length > 0 && (
                <ScrollArea className="h-48">
                  <div className="space-y-1">
                    {searchResults.map(country => (
                      <button
                        key={country.code}
                        onClick={() => handleCountryClick(country)}
                        className="w-full flex items-center justify-between p-2 text-left hover:bg-white rounded transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{country.flag}</span>
                          <span className="font-medium">{country.name}</span>
                          <span className="text-sm text-slate-500">{country.nameEn}</span>
                        </div>
                        <Badge variant="secondary">{country.dialCode}</Badge>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 查询结果 */}
      {result && result.success && result.country && (
        <Card className="shadow-lg border-green-200 bg-gradient-to-br from-green-50/50 to-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              查询结果
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 格式化号码 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">格式化号码</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(result.formattedNumber || '')}
                    className="flex items-center gap-1"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    复制
                  </Button>
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 flex items-center gap-1"
                    >
                      <MessageCircle className="w-4 h-4" />
                      打开WhatsApp
                    </Button>
                  </a>
                </div>
              </div>
              <div className="p-4 bg-white rounded-lg border border-slate-200">
                <div className="text-2xl md:text-3xl font-mono font-semibold text-slate-900">
                  {result.formattedNumberWithSpaces}
                </div>
                <div className="text-sm text-slate-500 mt-1">
                  原始输入: {result.originalInput}
                </div>
              </div>
            </div>

            <Separator />

            {/* 国家信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 基本信息 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-700">
                  <Globe className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">国家/地区信息</span>
                </div>
                <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{result.country.flag}</span>
                    <div>
                      <div className="text-lg font-semibold">{result.country.name}</div>
                      <div className="text-sm text-slate-500">{result.country.nameEn}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-slate-500">区号:</span>
                      <span className="ml-1 font-medium">{result.country.dialCode}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">首都:</span>
                      <span className="ml-1 font-medium">{result.country.capital}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">货币:</span>
                      <span className="ml-1 font-medium">{result.country.currency} ({result.country.currencyName})</span>
                    </div>
                    <div>
                      <span className="text-slate-500">地区:</span>
                      <span className="ml-1 font-medium">{result.country.region}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 时间信息 */}
              {timeInfo && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Clock className="w-5 h-5 text-orange-600" />
                    <span className="font-medium">当地时间</span>
                  </div>
                  <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-3">
                    <div className="text-3xl font-mono font-semibold text-slate-900">
                      {timeInfo.currentTime}
                    </div>
                    <div className="text-sm text-slate-600">
                      {timeInfo.date}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={timeInfo.isBusinessHours ? "default" : "secondary"}
                        className={timeInfo.isBusinessHours ? "bg-green-600" : ""}
                      >
                        {timeInfo.businessHoursStatus}
                      </Badge>
                      <span className="text-xs text-slate-500">{timeInfo.utcOffset}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 语言和位置 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-700">
                  <Languages className="w-5 h-5 text-purple-600" />
                  <span className="font-medium">主要语言</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.country.languages.map((lang, idx) => (
                    <Badge key={idx} variant="outline" className="bg-white">
                      {lang}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-700">
                  <MapPin className="w-5 h-5 text-red-600" />
                  <span className="font-medium">地理位置</span>
                </div>
                <div className="text-sm text-slate-600">
                  {result.country.region} · {result.country.capital}
                </div>
              </div>
            </div>

            {/* 可能的多个国家 */}
            {result.possibleCountries && result.possibleCountries.length > 1 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-700">
                  <Info className="w-5 h-5 text-amber-600" />
                  <span className="font-medium">可能的国家（共用区号）</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.possibleCountries.map(country => (
                    <Badge key={country.code} variant="secondary" className="flex items-center gap-1">
                      <span>{country.flag}</span>
                      <span>{country.name}</span>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 错误结果 */}
      {result && !result.success && (
        <Card className="shadow-lg border-red-200 bg-red-50/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-red-700">
              <Info className="w-6 h-6" />
              <div>
                <div className="font-semibold">解析失败</div>
                <div className="text-sm">{result.error}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 选中的国家详情 */}
      {selectedCountry && (
        <Card className="shadow-lg border-blue-200">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                {selectedCountry.name} 详细信息
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedCountry(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-6xl">{selectedCountry.flag}</span>
              <div>
                <div className="text-2xl font-bold">{selectedCountry.name}</div>
                <div className="text-lg text-slate-500">{selectedCountry.nameEn}</div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-lg">{selectedCountry.dialCode}</Badge>
                  <span className="text-sm text-slate-500">{selectedCountry.region}</span>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-slate-500 text-sm">
                  <Building2 className="w-4 h-4" />
                  首都
                </div>
                <div className="font-medium">{selectedCountry.capital}</div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-slate-500 text-sm">
                  <DollarSign className="w-4 h-4" />
                  货币
                </div>
                <div className="font-medium">{selectedCountry.currency}</div>
                <div className="text-xs text-slate-500">{selectedCountry.currencyName}</div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-slate-500 text-sm">
                  <Clock className="w-4 h-4" />
                  时区
                </div>
                <div className="font-medium text-sm">{selectedCountry.timezone}</div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-slate-500 text-sm">
                  <Phone className="w-4 h-4" />
                  号码格式
                </div>
                <div className="font-medium text-sm">{selectedCountry.numberFormat}</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-slate-500 text-sm">
                <Languages className="w-4 h-4" />
                语言
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedCountry.languages.map((lang: string, idx: number) => (
                  <Badge key={idx} variant="outline">{lang}</Badge>
                ))}
              </div>
            </div>
            
            <div className="pt-2">
              <Button 
                onClick={() => {
                  setInput(selectedCountry.dialCode + ' ');
                  setSelectedCountry(null);
                }}
                className="w-full"
              >
                使用此区号查询号码
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 历史记录 */}
      {history.length > 0 && (
        <Card className="shadow-lg border-slate-200">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle 
                className="text-lg flex items-center gap-2 cursor-pointer"
                onClick={() => setShowHistory(!showHistory)}
              >
                <History className="w-5 h-5 text-slate-600" />
                查询历史
                <Badge variant="secondary">{history.length}</Badge>
                {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleClearHistory}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                清空
              </Button>
            </div>
          </CardHeader>
          {showHistory && (
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {history.map((item) => (
                    <div 
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => handleUseHistory(item)}
                      >
                        <div className="flex items-center gap-2">
                          {item.result.country && (
                            <span className="text-lg">{item.result.country.flag}</span>
                          )}
                          <span className="font-mono font-medium">{item.result.formattedNumberWithSpaces}</span>
                          {item.result.country && (
                            <span className="text-sm text-slate-500">{item.result.country.name}</span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          {new Date(item.timestamp).toLocaleString('zh-CN')}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(item.result.formattedNumber || '')}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteHistoryItem(item.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}
