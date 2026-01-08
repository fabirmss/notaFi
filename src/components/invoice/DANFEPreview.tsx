import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Download, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface InvoiceItem {
  id: number;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface DANFEPreviewProps {
  open: boolean;
  onClose: () => void;
  invoiceData: {
    number: string;
    series: string;
    emissionDate: string;
    exitTime: string;
    client: {
      name: string;
      cnpj: string;
      address: string;
      neighborhood: string;
      city: string;
      state: string;
      cep: string;
      phone: string;
      ie: string;
    };
    transporter: {
      name: string;
      cnpj: string;
      address: string;
      city: string;
      state: string;
      ie: string;
      plate: string;
      freightType: string;
    };
    items: InvoiceItem[];
    totals: {
      products: number;
      freight: number;
      insurance: number;
      otherExpenses: number;
      icmsBase: number;
      icmsValue: number;
      ipiValue: number;
      total: number;
    };
    observations: string;
    natureOfOperation: string;
    cfop: string;
  };
  emitter: {
    name: string;
    cnpj: string;
    address: string;
    neighborhood: string;
    city: string;
    state: string;
    cep: string;
    phone: string;
    ie: string;
  };
}

export function DANFEPreview({ open, onClose, invoiceData, emitter }: DANFEPreviewProps) {
  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatCNPJ = (cnpj: string) => {
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto p-0 bg-white">
        <DialogHeader className="sticky top-0 z-10 bg-white border-b p-4 flex flex-row items-center justify-between">
          <DialogTitle className="text-lg font-semibold text-slate-900">
            Pré-visualização DANFE - Nota Fiscal Nº {invoiceData.number}
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* DANFE Document */}
        <div className="p-6 print:p-0">
          <div className="border-2 border-slate-900 bg-white text-slate-900 text-xs font-mono">
            
            {/* Header - Emitente */}
            <div className="border-b-2 border-slate-900">
              <div className="grid grid-cols-12">
                {/* Logo e Dados do Emitente */}
                <div className="col-span-5 border-r-2 border-slate-900 p-2">
                  <div className="text-center mb-2">
                    <div className="w-16 h-16 mx-auto border border-slate-400 flex items-center justify-center text-slate-400 text-[10px]">
                      LOGO
                    </div>
                  </div>
                  <div className="text-center font-bold text-sm mb-1">{emitter.name}</div>
                  <div className="text-center text-[10px]">{emitter.address}</div>
                  <div className="text-center text-[10px]">{emitter.neighborhood} - {emitter.city}/{emitter.state}</div>
                  <div className="text-center text-[10px]">CEP: {emitter.cep} - Fone: {emitter.phone}</div>
                </div>

                {/* Identificação da NF */}
                <div className="col-span-4 border-r-2 border-slate-900">
                  <div className="bg-slate-900 text-white text-center py-1 font-bold">
                    DANFE
                  </div>
                  <div className="text-center text-[9px] p-1">
                    DOCUMENTO AUXILIAR DA<br />NOTA FISCAL ELETRÔNICA
                  </div>
                  <div className="grid grid-cols-2 border-t border-slate-400">
                    <div className="border-r border-slate-400 p-1 text-center">
                      <div className="text-[8px] text-slate-500">ENTRADA</div>
                      <div className="text-lg font-bold"></div>
                    </div>
                    <div className="p-1 text-center">
                      <div className="text-[8px] text-slate-500">SAÍDA</div>
                      <div className="text-lg font-bold">X</div>
                    </div>
                  </div>
                  <div className="border-t border-slate-400 p-1 text-center">
                    <div className="text-[8px] text-slate-500">Nº</div>
                    <div className="font-bold">{invoiceData.number}</div>
                  </div>
                  <div className="border-t border-slate-400 p-1 text-center">
                    <div className="text-[8px] text-slate-500">SÉRIE</div>
                    <div className="font-bold">{invoiceData.series}</div>
                  </div>
                  <div className="border-t border-slate-400 p-1 text-center">
                    <div className="text-[8px] text-slate-500">FOLHA</div>
                    <div>1/1</div>
                  </div>
                </div>

                {/* Código de Barras */}
                <div className="col-span-3 p-2 flex flex-col">
                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-full h-12 bg-gradient-to-r from-slate-900 via-white to-slate-900 bg-[length:4px_100%]" 
                         style={{ backgroundImage: 'repeating-linear-gradient(90deg, #0f172a 0px, #0f172a 2px, white 2px, white 4px)' }}>
                    </div>
                  </div>
                  <div className="text-[8px] text-center mt-1 break-all">
                    3523 0812 3456 7890 0012 3400 0000 0001 2312 3456 7890
                  </div>
                </div>
              </div>

              {/* Chave de Acesso */}
              <div className="border-t-2 border-slate-900 p-2">
                <div className="text-[8px] text-slate-500">CHAVE DE ACESSO</div>
                <div className="text-center font-mono tracking-wider">
                  3523 0812 3456 7890 0012 3400 0000 0001 2312 3456 7890
                </div>
              </div>

              {/* Consulta */}
              <div className="border-t border-slate-400 p-1 text-center text-[9px]">
                Consulta de autenticidade no portal nacional da NF-e: www.nfe.fazenda.gov.br/portal
              </div>
            </div>

            {/* Natureza da Operação */}
            <div className="grid grid-cols-12 border-b border-slate-400">
              <div className="col-span-8 border-r border-slate-400 p-1">
                <div className="text-[8px] text-slate-500">NATUREZA DA OPERAÇÃO</div>
                <div className="font-semibold">{invoiceData.natureOfOperation}</div>
              </div>
              <div className="col-span-4 p-1">
                <div className="text-[8px] text-slate-500">PROTOCOLO DE AUTORIZAÇÃO</div>
                <div>135230000000000 - {invoiceData.emissionDate}</div>
              </div>
            </div>

            {/* Dados do Emitente - Detalhados */}
            <div className="grid grid-cols-12 border-b-2 border-slate-900">
              <div className="col-span-6 border-r border-slate-400 p-1">
                <div className="text-[8px] text-slate-500">INSCRIÇÃO ESTADUAL</div>
                <div>{emitter.ie}</div>
              </div>
              <div className="col-span-3 border-r border-slate-400 p-1">
                <div className="text-[8px] text-slate-500">INSC. EST. SUBST. TRIB.</div>
                <div></div>
              </div>
              <div className="col-span-3 p-1">
                <div className="text-[8px] text-slate-500">CNPJ</div>
                <div>{formatCNPJ(emitter.cnpj)}</div>
              </div>
            </div>

            {/* Destinatário */}
            <div className="bg-slate-100 px-2 py-1 font-bold border-b border-slate-400">
              DESTINATÁRIO / REMETENTE
            </div>
            <div className="grid grid-cols-12 border-b border-slate-400">
              <div className="col-span-8 border-r border-slate-400 p-1">
                <div className="text-[8px] text-slate-500">NOME / RAZÃO SOCIAL</div>
                <div className="font-semibold">{invoiceData.client.name}</div>
              </div>
              <div className="col-span-2 border-r border-slate-400 p-1">
                <div className="text-[8px] text-slate-500">CNPJ / CPF</div>
                <div>{formatCNPJ(invoiceData.client.cnpj)}</div>
              </div>
              <div className="col-span-2 p-1">
                <div className="text-[8px] text-slate-500">DATA EMISSÃO</div>
                <div>{invoiceData.emissionDate}</div>
              </div>
            </div>
            <div className="grid grid-cols-12 border-b border-slate-400">
              <div className="col-span-6 border-r border-slate-400 p-1">
                <div className="text-[8px] text-slate-500">ENDEREÇO</div>
                <div>{invoiceData.client.address}</div>
              </div>
              <div className="col-span-3 border-r border-slate-400 p-1">
                <div className="text-[8px] text-slate-500">BAIRRO / DISTRITO</div>
                <div>{invoiceData.client.neighborhood}</div>
              </div>
              <div className="col-span-3 p-1">
                <div className="text-[8px] text-slate-500">CEP</div>
                <div>{invoiceData.client.cep}</div>
              </div>
            </div>
            <div className="grid grid-cols-12 border-b-2 border-slate-900">
              <div className="col-span-5 border-r border-slate-400 p-1">
                <div className="text-[8px] text-slate-500">MUNICÍPIO</div>
                <div>{invoiceData.client.city}</div>
              </div>
              <div className="col-span-2 border-r border-slate-400 p-1">
                <div className="text-[8px] text-slate-500">FONE / FAX</div>
                <div>{invoiceData.client.phone}</div>
              </div>
              <div className="col-span-1 border-r border-slate-400 p-1">
                <div className="text-[8px] text-slate-500">UF</div>
                <div>{invoiceData.client.state}</div>
              </div>
              <div className="col-span-2 border-r border-slate-400 p-1">
                <div className="text-[8px] text-slate-500">INSCRIÇÃO ESTADUAL</div>
                <div>{invoiceData.client.ie}</div>
              </div>
              <div className="col-span-2 p-1">
                <div className="text-[8px] text-slate-500">HORA DA SAÍDA</div>
                <div>{invoiceData.exitTime}</div>
              </div>
            </div>

            {/* Produtos */}
            <div className="bg-slate-100 px-2 py-1 font-bold border-b border-slate-400">
              DADOS DOS PRODUTOS / SERVIÇOS
            </div>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-400 text-[8px]">
                  <th className="border-r border-slate-400 p-1 text-left">CÓD. PROD.</th>
                  <th className="border-r border-slate-400 p-1 text-left w-1/3">DESCRIÇÃO DO PRODUTO / SERVIÇO</th>
                  <th className="border-r border-slate-400 p-1 text-center">NCM/SH</th>
                  <th className="border-r border-slate-400 p-1 text-center">CST</th>
                  <th className="border-r border-slate-400 p-1 text-center">CFOP</th>
                  <th className="border-r border-slate-400 p-1 text-center">UN</th>
                  <th className="border-r border-slate-400 p-1 text-right">QTD</th>
                  <th className="border-r border-slate-400 p-1 text-right">VL UNIT</th>
                  <th className="border-r border-slate-400 p-1 text-right">VL TOTAL</th>
                  <th className="border-r border-slate-400 p-1 text-right">BC ICMS</th>
                  <th className="border-r border-slate-400 p-1 text-right">VL ICMS</th>
                  <th className="border-r border-slate-400 p-1 text-right">VL IPI</th>
                  <th className="p-1 text-right">%ICMS</th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.items.map((item, index) => (
                  <tr key={index} className="border-b border-slate-300 text-[9px]">
                    <td className="border-r border-slate-300 p-1">{item.productId}</td>
                    <td className="border-r border-slate-300 p-1">{item.productName}</td>
                    <td className="border-r border-slate-300 p-1 text-center">84713012</td>
                    <td className="border-r border-slate-300 p-1 text-center">000</td>
                    <td className="border-r border-slate-300 p-1 text-center">{invoiceData.cfop}</td>
                    <td className="border-r border-slate-300 p-1 text-center">UN</td>
                    <td className="border-r border-slate-300 p-1 text-right">{item.quantity}</td>
                    <td className="border-r border-slate-300 p-1 text-right">{item.unitPrice.toFixed(2)}</td>
                    <td className="border-r border-slate-300 p-1 text-right">{item.subtotal.toFixed(2)}</td>
                    <td className="border-r border-slate-300 p-1 text-right">{item.subtotal.toFixed(2)}</td>
                    <td className="border-r border-slate-300 p-1 text-right">{(item.subtotal * 0.18).toFixed(2)}</td>
                    <td className="border-r border-slate-300 p-1 text-right">0,00</td>
                    <td className="p-1 text-right">18%</td>
                  </tr>
                ))}
                {/* Empty rows for minimum height */}
                {Array.from({ length: Math.max(0, 5 - invoiceData.items.length) }).map((_, i) => (
                  <tr key={`empty-${i}`} className="border-b border-slate-300 h-6">
                    <td className="border-r border-slate-300"></td>
                    <td className="border-r border-slate-300"></td>
                    <td className="border-r border-slate-300"></td>
                    <td className="border-r border-slate-300"></td>
                    <td className="border-r border-slate-300"></td>
                    <td className="border-r border-slate-300"></td>
                    <td className="border-r border-slate-300"></td>
                    <td className="border-r border-slate-300"></td>
                    <td className="border-r border-slate-300"></td>
                    <td className="border-r border-slate-300"></td>
                    <td className="border-r border-slate-300"></td>
                    <td className="border-r border-slate-300"></td>
                    <td></td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Cálculo do Imposto */}
            <div className="bg-slate-100 px-2 py-1 font-bold border-y border-slate-400">
              CÁLCULO DO IMPOSTO
            </div>
            <div className="grid grid-cols-10 border-b-2 border-slate-900">
              <div className="col-span-2 border-r border-slate-400 p-1">
                <div className="text-[8px] text-slate-500">BASE DE CÁLC. ICMS</div>
                <div className="text-right">{formatCurrency(invoiceData.totals.icmsBase)}</div>
              </div>
              <div className="col-span-2 border-r border-slate-400 p-1">
                <div className="text-[8px] text-slate-500">VALOR DO ICMS</div>
                <div className="text-right">{formatCurrency(invoiceData.totals.icmsValue)}</div>
              </div>
              <div className="col-span-2 border-r border-slate-400 p-1">
                <div className="text-[8px] text-slate-500">BASE DE CÁLC. ICMS ST</div>
                <div className="text-right">R$ 0,00</div>
              </div>
              <div className="col-span-2 border-r border-slate-400 p-1">
                <div className="text-[8px] text-slate-500">VALOR DO ICMS ST</div>
                <div className="text-right">R$ 0,00</div>
              </div>
              <div className="col-span-2 p-1">
                <div className="text-[8px] text-slate-500">VALOR TOTAL PRODUTOS</div>
                <div className="text-right font-bold">{formatCurrency(invoiceData.totals.products)}</div>
              </div>
            </div>
            <div className="grid grid-cols-10 border-b-2 border-slate-900">
              <div className="col-span-2 border-r border-slate-400 p-1">
                <div className="text-[8px] text-slate-500">VALOR DO FRETE</div>
                <div className="text-right">{formatCurrency(invoiceData.totals.freight)}</div>
              </div>
              <div className="col-span-2 border-r border-slate-400 p-1">
                <div className="text-[8px] text-slate-500">VALOR DO SEGURO</div>
                <div className="text-right">{formatCurrency(invoiceData.totals.insurance)}</div>
              </div>
              <div className="col-span-2 border-r border-slate-400 p-1">
                <div className="text-[8px] text-slate-500">DESCONTO</div>
                <div className="text-right">R$ 0,00</div>
              </div>
              <div className="col-span-2 border-r border-slate-400 p-1">
                <div className="text-[8px] text-slate-500">OUTRAS DESP. ACESS.</div>
                <div className="text-right">{formatCurrency(invoiceData.totals.otherExpenses)}</div>
              </div>
              <div className="col-span-2 p-1">
                <div className="text-[8px] text-slate-500">VALOR TOTAL DA NOTA</div>
                <div className="text-right font-bold text-base">{formatCurrency(invoiceData.totals.total)}</div>
              </div>
            </div>

            {/* Transportador */}
            <div className="bg-slate-100 px-2 py-1 font-bold border-b border-slate-400">
              TRANSPORTADOR / VOLUMES TRANSPORTADOS
            </div>
            <div className="grid grid-cols-12 border-b border-slate-400">
              <div className="col-span-4 border-r border-slate-400 p-1">
                <div className="text-[8px] text-slate-500">NOME / RAZÃO SOCIAL</div>
                <div>{invoiceData.transporter.name}</div>
              </div>
              <div className="col-span-2 border-r border-slate-400 p-1">
                <div className="text-[8px] text-slate-500">FRETE POR CONTA</div>
                <div>{invoiceData.transporter.freightType}</div>
              </div>
              <div className="col-span-2 border-r border-slate-400 p-1">
                <div className="text-[8px] text-slate-500">CÓD. ANTT</div>
                <div></div>
              </div>
              <div className="col-span-2 border-r border-slate-400 p-1">
                <div className="text-[8px] text-slate-500">PLACA VEÍCULO</div>
                <div>{invoiceData.transporter.plate}</div>
              </div>
              <div className="col-span-1 border-r border-slate-400 p-1">
                <div className="text-[8px] text-slate-500">UF</div>
                <div>{invoiceData.transporter.state}</div>
              </div>
              <div className="col-span-1 p-1">
                <div className="text-[8px] text-slate-500">CNPJ/CPF</div>
                <div className="text-[8px]">{invoiceData.transporter.cnpj}</div>
              </div>
            </div>
            <div className="grid grid-cols-12 border-b-2 border-slate-900">
              <div className="col-span-4 border-r border-slate-400 p-1">
                <div className="text-[8px] text-slate-500">ENDEREÇO</div>
                <div>{invoiceData.transporter.address}</div>
              </div>
              <div className="col-span-3 border-r border-slate-400 p-1">
                <div className="text-[8px] text-slate-500">MUNICÍPIO</div>
                <div>{invoiceData.transporter.city}</div>
              </div>
              <div className="col-span-1 border-r border-slate-400 p-1">
                <div className="text-[8px] text-slate-500">UF</div>
                <div>{invoiceData.transporter.state}</div>
              </div>
              <div className="col-span-2 border-r border-slate-400 p-1">
                <div className="text-[8px] text-slate-500">INSCRIÇÃO ESTADUAL</div>
                <div>{invoiceData.transporter.ie}</div>
              </div>
              <div className="col-span-2 p-1">
                <div className="text-[8px] text-slate-500">QTDE. VOLUMES</div>
                <div>{invoiceData.items.reduce((acc, item) => acc + item.quantity, 0)}</div>
              </div>
            </div>

            {/* Dados Adicionais */}
            <div className="bg-slate-100 px-2 py-1 font-bold border-b border-slate-400">
              DADOS ADICIONAIS
            </div>
            <div className="grid grid-cols-2 border-b-2 border-slate-900">
              <div className="border-r border-slate-400 p-2 min-h-[60px]">
                <div className="text-[8px] text-slate-500">INFORMAÇÕES COMPLEMENTARES</div>
                <div className="text-[9px] mt-1">{invoiceData.observations}</div>
              </div>
              <div className="p-2">
                <div className="text-[8px] text-slate-500">RESERVADO AO FISCO</div>
              </div>
            </div>

            {/* Recibo */}
            <div className="border-t-2 border-dashed border-slate-400 mt-2">
              <div className="grid grid-cols-12 p-2">
                <div className="col-span-9 border-r border-slate-400 pr-2">
                  <div className="text-[8px] text-slate-500 mb-1">
                    RECEBEMOS DE {emitter.name} OS PRODUTOS/SERVIÇOS CONSTANTES DA NOTA FISCAL INDICADA AO LADO
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <div className="text-[8px] text-slate-500">DATA DE RECEBIMENTO</div>
                      <div className="border-b border-slate-400 h-6"></div>
                    </div>
                    <div>
                      <div className="text-[8px] text-slate-500">IDENTIFICAÇÃO E ASSINATURA DO RECEBEDOR</div>
                      <div className="border-b border-slate-400 h-6"></div>
                    </div>
                  </div>
                </div>
                <div className="col-span-3 pl-2 text-center">
                  <div className="text-[8px] text-slate-500">NF-e</div>
                  <div className="font-bold text-lg">Nº {invoiceData.number}</div>
                  <div className="text-[9px]">SÉRIE {invoiceData.series}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
