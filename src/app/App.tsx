import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, X, Printer, Download, FileText, Sparkles } from 'lucide-react';

interface ReceiptData {
  pagador: string;
  recebedor: string;
  valor: number;
  data: string;
  descricao: string;
  logoUrl?: string;
  numero: string;
}

function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

function formatDate(dateString: string): string {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

function valorPorExtenso(n: number): string {
  if (isNaN(n) || n < 0) return '';
  const inteiro = Math.floor(n);
  const centavos = Math.round((n - inteiro) * 100);

  function porExtenso(num: number): string {
    const unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove',
      'dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
    const dezenas = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
    const centenas = ['', 'cem', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos',
      'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

    if (num === 0) return 'zero';
    if (num === 100) return 'cem';
    if (num < 20) return unidades[num];
    if (num < 100) {
      const dez = Math.floor(num / 10);
      const uni = num % 10;
      return dezenas[dez] + (uni ? ' e ' + unidades[uni] : '');
    }
    if (num < 1000) {
      const cen = Math.floor(num / 100);
      const resto = num % 100;
      return centenas[cen] + (resto ? ' e ' + porExtenso(resto) : '');
    }
    if (num < 1000000) {
      const mil = Math.floor(num / 1000);
      const resto = num % 1000;
      const prefixo = mil === 1 ? 'mil' : porExtenso(mil) + ' mil';
      return prefixo + (resto ? ' e ' + porExtenso(resto) : '');
    }
    const mi = Math.floor(num / 1000000);
    const resto = num % 1000000;
    const prefixo = mi === 1 ? 'um milhão' : porExtenso(mi) + ' milhões';
    return prefixo + (resto ? ' e ' + porExtenso(resto) : '');
  }

  const parteInteira = inteiro === 0 ? 'zero' : porExtenso(inteiro);
  const moedaInt = inteiro === 1 ? 'real' : 'reais';

  if (centavos === 0) return `${parteInteira} ${moedaInt}`;
  const parteCentavos = porExtenso(centavos);
  const moedaCent = centavos === 1 ? 'centavo' : 'centavos';
  return `${parteInteira} ${moedaInt} e ${parteCentavos} ${moedaCent}`;
}

function gerarNumeroRecibo(): string {
  return String(Math.floor(Math.random() * 9000) + 1000);
}

export default function App() {
  const [formData, setFormData] = useState({
    pagador: '',
    recebedor: '',
    valor: '',
    data: new Date().toISOString().split('T')[0],
    descricao: ''
  });

  const [logoFile, setLogoFile] = useState<{ url: string; name: string } | null>(null);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/image\/(png|jpeg|jpg)/)) {
      alert('Por favor, envie apenas imagens PNG ou JPG.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setLogoFile({
        url: event.target?.result as string,
        name: file.name
      });
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGenerate = () => {
    const { pagador, recebedor, valor, data, descricao } = formData;
    const valorNum = parseFloat(valor);

    if (!pagador.trim()) {
      alert('Por favor, informe o nome do pagador.');
      return;
    }
    if (!recebedor.trim()) {
      alert('Por favor, informe o nome do recebedor.');
      return;
    }
    if (isNaN(valorNum) || valorNum <= 0) {
      alert('Por favor, informe um valor válido (maior que zero).');
      return;
    }
    if (!data) {
      alert('Por favor, informe a data.');
      return;
    }

    setReceiptData({
      pagador: pagador.trim(),
      recebedor: recebedor.trim(),
      valor: valorNum,
      data,
      descricao: descricao.trim(),
      logoUrl: logoFile?.url,
      numero: gerarNumeroRecibo()
    });

    setTimeout(() => {
      receiptRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fafaf8] via-[#f5f5f3] to-[#fef3e2] print:bg-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 text-white print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <FileText className="w-10 h-10" />
              <h1 className="text-4xl md:text-5xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                Gerador de Recibos
              </h1>
            </div>
            <p className="text-emerald-50 text-lg max-w-2xl mx-auto">
              Crie recibos profissionais online de forma gratuita, rápida e segura
            </p>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="print:hidden"
          >
            <div className="bg-white rounded-2xl shadow-xl border border-border p-6 md:p-8">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
                <Sparkles className="w-6 h-6 text-secondary" />
                Dados do Recibo
              </h2>

              <div className="space-y-5">
                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                    Logo do Negócio (Opcional)
                  </label>
                  {!logoFile ? (
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary hover:bg-accent/50 transition-all"
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                      <p className="font-medium text-primary">Clique para enviar sua logo</p>
                      <p className="text-sm text-muted-foreground mt-1">PNG ou JPG — aparece no topo do recibo</p>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-3 p-4 bg-accent rounded-xl border border-border"
                    >
                      <img src={logoFile.url} alt="Logo preview" className="h-16 w-16 object-contain rounded" />
                      <span className="flex-1 text-sm font-medium truncate">{logoFile.name}</span>
                      <button
                        onClick={removeLogo}
                        className="p-2 hover:bg-destructive/10 rounded-lg text-destructive transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </motion.div>
                  )}
                </div>

                {/* Pagador e Recebedor */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="pagador" className="block text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                      Pagador *
                    </label>
                    <input
                      type="text"
                      id="pagador"
                      name="pagador"
                      value={formData.pagador}
                      onChange={handleInputChange}
                      placeholder="Ex.: João da Silva"
                      className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="recebedor" className="block text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                      Recebedor *
                    </label>
                    <input
                      type="text"
                      id="recebedor"
                      name="recebedor"
                      value={formData.recebedor}
                      onChange={handleInputChange}
                      placeholder="Ex.: Maria Ltda."
                      className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                </div>

                {/* Valor e Data */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="valor" className="block text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                      Valor (R$) *
                    </label>
                    <input
                      type="number"
                      id="valor"
                      name="valor"
                      value={formData.valor}
                      onChange={handleInputChange}
                      placeholder="0,00"
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="data" className="block text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                      Data *
                    </label>
                    <input
                      type="date"
                      id="data"
                      name="data"
                      value={formData.data}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                </div>

                {/* Descrição */}
                <div>
                  <label htmlFor="descricao" className="block text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                    Descrição (Opcional)
                  </label>
                  <textarea
                    id="descricao"
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleInputChange}
                    placeholder="Ex.: Serviço de consultoria referente ao mês de abril de 2026."
                    rows={3}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                  />
                </div>

                {/* Generate Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGenerate}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Gerar Recibo
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Receipt Preview */}
          <div className="print:col-span-2">
            <AnimatePresence mode="wait">
              {receiptData ? (
                <motion.div
                  ref={receiptRef}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.5 }}
                  className="sticky top-8"
                >
                  {/* Action Buttons */}
                  <div className="flex gap-3 mb-4 print:hidden">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handlePrint}
                      className="flex-1 bg-white border-2 border-primary text-primary py-3 px-4 rounded-xl font-semibold hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <Printer className="w-5 h-5" />
                      Imprimir
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handlePrint}
                      className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-600 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                    >
                      <Download className="w-5 h-5" />
                      Baixar PDF
                    </motion.button>
                  </div>

                  {/* Receipt */}
                  <div className="bg-white rounded-2xl shadow-2xl border border-border p-8 md:p-12 print:shadow-none print:border-0 print:rounded-none">
                    {/* Header */}
                    <div className="text-center mb-8">
                      {receiptData.logoUrl && (
                        <motion.img
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          src={receiptData.logoUrl}
                          alt="Logo"
                          className="max-h-20 max-w-56 object-contain mx-auto mb-6"
                        />
                      )}
                      <h3 className="text-5xl font-bold tracking-widest mb-2 text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
                        RECIBO
                      </h3>
                      <p className="text-sm text-muted-foreground">Nº {receiptData.numero}</p>
                    </div>

                    <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-8" />

                    {/* Value */}
                    <div className="text-center mb-8 p-6 bg-gradient-to-br from-accent to-amber-50 rounded-xl border border-secondary/20">
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-5xl font-bold text-primary mb-2"
                      >
                        {formatBRL(receiptData.valor)}
                      </motion.div>
                      <p className="text-sm italic text-muted-foreground">
                        {valorPorExtenso(receiptData.valor)}
                      </p>
                    </div>

                    <div className="h-px bg-border mb-6" />

                    {/* Details */}
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Pagador:</span>
                        <span className="font-semibold text-right">{receiptData.pagador}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Recebedor:</span>
                        <span className="font-semibold text-right">{receiptData.recebedor}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Data:</span>
                        <span className="font-semibold text-right">{formatDate(receiptData.data)}</span>
                      </div>
                    </div>

                    {receiptData.descricao && (
                      <div className="mb-6 p-4 bg-muted rounded-lg">
                        <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">Referente a:</p>
                        <p className="text-sm">{receiptData.descricao}</p>
                      </div>
                    )}

                    <div className="h-px bg-border mb-8" />

                    {/* Declaration */}
                    <p className="text-center italic text-sm text-muted-foreground mb-12">
                      Declaro que recebi o valor acima descrito, em plena e total quitação.
                    </p>

                    {/* Signature */}
                    <div className="flex justify-center">
                      <div className="w-72 text-center">
                        <div className="h-12 border-b-2 border-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          {receiptData.recebedor}
                        </p>
                        <p className="text-xs text-muted-foreground">Assinatura do Recebedor</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hidden lg:flex items-center justify-center h-full bg-white/50 rounded-2xl border-2 border-dashed border-border p-12 text-center print:hidden"
                >
                  <div>
                    <FileText className="w-20 h-20 mx-auto mb-4 text-muted-foreground/30" />
                    <p className="text-lg text-muted-foreground">
                      Preencha os dados ao lado para visualizar o recibo
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-sm text-muted-foreground print:hidden">
        <p>Gerador de Recibo Online Grátis — Nenhum dado é enviado a servidores externos.</p>
      </footer>

      {/* Print Styles */}
      <style>{`
        @media print {
          body > *:not(#root) {
            display: none !important;
          }

          .print\\:hidden {
            display: none !important;
          }

          @page {
            margin: 0.5in;
          }
        }
      `}</style>
    </div>
  );
}
