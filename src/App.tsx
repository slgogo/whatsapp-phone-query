import { PhoneQuery } from '@/components/PhoneQuery';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

function App() {
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
        {/* 背景装饰 */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -left-40 w-80 h-80 bg-green-200/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 right-1/4 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl" />
        </div>
        
        {/* 主内容 */}
        <div className="relative z-10 py-8 px-4">
          <PhoneQuery />
        </div>
        
        {/* 页脚 */}
        <footer className="relative z-10 py-6 text-center text-sm text-slate-500">
          <p>WhatsApp外贸号码查询系统 · 专为工程机械外贸团队设计</p>
          <p className="mt-1">支持 200+ 国家和地区 · 实时时区查询 · 智能号码格式化</p>
        </footer>
        
        {/* Toast通知 */}
        <Toaster position="top-center" richColors />
      </div>
    </TooltipProvider>
  );
}

export default App;
