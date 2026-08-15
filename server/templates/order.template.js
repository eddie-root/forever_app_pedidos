function formatCurrency(valueInCents) {
  if (!valueInCents && valueInCents !== 0) return "R$ 0,00";
  return (valueInCents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })
}

function formatCNPJ(cnpj) {
  if (!cnpj) return "";
  const pure = cnpj.replace(/\D/g, "");
  if (pure.length !== 14) return cnpj;
  return pure.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

function formatCEP(cep) {
  if (!cep) return "";
  const pure = cep.replace(/\D/g, "");
  if (pure.length !== 8) return cep;
  return pure.replace(/^(\d{5})(\d{3})$/, "$1-$2");
}

function formatPhone(phone) {
  if (!phone) return "";
  const pure = phone.replace(/\D/g, "");
  if (pure.length === 11) {
    return pure.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
  }
  if (pure.length === 10) {
    return pure.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
  }
  return phone;
}

export function orderTemplate(order, company) {
  return `
  <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 40px;
          font-size: 12px;
          color: #333;
          line-height: 1.4;
        }

        h1 {
          font-size: 20px;
          margin-bottom: 4px;
        }

        .header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
        }

        .section {
          margin-bottom: 20px;
        }

        .section-title {
          font-weight: bold;
          margin-bottom: 6px;
          font-size: 14px;
          border-bottom: 1px solid #000;
          display: inline-block;
          width: 100%;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }

        th {
          text-align: left;
          padding: 8px 6px;
          border-bottom: 2px solid #000;
          font-size: 11px;
          background-color: #f9f9f9;
        }

        td {
          padding: 6px 6px;
          border-bottom: 1px solid #ddd;
          font-size: 10px;
          vertical-align: top;
        }

        .right {
          text-align: right;
        }

        .total-box {
          margin-top: 20px;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          font-size: 14px;
          font-weight: bold;
          border-top: 2px solid #000;
          padding-top: 10px;
        }

        .footer {
          margin-top: 30px;
          font-size: 12px;
          color: #333;
          border-top: 1px solid #eee;
          padding-top: 15px;
        }
        
        @page {
          size: A4;
          margin: 15mm;
        }

        thead {
          display: table-header-group;
        }

        tr {
          page-break-inside: avoid;
        }
      </style>
    </head>

    <body>

      <div class="header">
        <div>
          <h1>${company.nome}</h1>
          <div>${company.email}</div>
          <div><strong>Representada:</strong> ${company.representada}</div>
        </div>

        <div class="right">
          <div style="font-size: 16px; font-weight: bold;">PEDIDO Nº: ${order.numberPedido}</div>
          <div>Data: ${new Date(order.issueDate).toLocaleDateString("pt-BR")}</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">CLIENTE</div>
        <div style="display: grid; grid-template-cols: 1fr 1fr; gap: 5px;">
          <div><strong>Razão Social:</strong> ${order.client.rSocial}</div>
          <div><strong>Nome Fantasia:</strong> ${order.client.nFantasia}</div>
          <div><strong>CNPJ:</strong> ${formatCNPJ(order.client.cnpj)}</div>
          ${order.client.suframa ? `<div><strong>SUFRAMA:</strong> ${order.client.suframa}</div>` : ""}
          <div><strong>Inscrição Estadual:</strong> ${order.client.inscEstadual || "Isento"}</div>
          <div><strong>Endereço:</strong> ${order.client.address}, ${order.client.bairro}</div>
          <div><strong>Cidade/UF:</strong> ${order.client.city} - ${order.client.county} | <strong>CEP:</strong> ${formatCEP(order.client.cep)}</div>
          <div><strong>Telefone:</strong> ${formatPhone(order.client.phone || order.client.cellPhone)}</div>
          <div><strong>Email:</strong> ${order.client.email}</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">ITENS DO PEDIDO</div>
        <table>
          <thead>
            <tr>
              <th>Produto</th>
              <th>Estrutura / Revestimento / Tela</th>
              <th style="text-align:center">Qtd</th>
              <th style="text-align:center">Desc. %</th>
              <th class="right">Preço Un.</th>
              <th class="right">Subtotal c/ Desc.</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr>
                <td>
                  <div style="font-weight:bold">${item.cod} - ${item.name}</div>
                  <div style="font-size: 9px; color: #666; margin-top: 2px;">${item.description}</div>
                </td>
                <td>
                  <div style="font-size: 9px;"><strong>Est:</strong> ${item.structureName}</div>
                  <div style="font-size: 9px;"><strong>Rev:</strong> ${item.materialName}</div>
                  ${item.colorTelas ? `<div style="font-size: 9px;"><strong>Tela:</strong> ${item.colorTelas}</div>` : ''}
                </td>
                <td style="text-align:center">${item.quantity}</td>
                <td style="text-align:center">
                  <div style="font-size: 9px;">
                    ${item.discount1}%
                    ${item.discount2 > 0 ? ` + ${item.discount2}%` : ''}
                    ${item.discount3 > 0 ? ` + ${item.discount3}%` : ''}
                    ${item.discount4 > 0 ? ` + ${item.discount4}%` : ''}
                  </div>
                </td>
                <td class="right">${formatCurrency(item.priceWithDiscount)}</td>
                <td class="right" style="font-weight:bold">${formatCurrency(item.priceTotalWithDisc)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="total-box">
        <span>TOTAL GERAL DO PEDIDO:</span>
        <span>${formatCurrency(order.totalWithDiscounts)}</span>
      </div>

      <div class="footer">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div><strong>Condição de Pagamento:</strong> ${order.term || "A combinar"}</div>
          <div><strong>Tipo de Frete:</strong> ${order.typeShipping || "-"}</div>
          <div><strong>Transportadora:</strong> ${order.carrying || "A definir"}</div>
        </div>
        ${order.observations ? `
          <div style="margin-top:15px; padding: 10px; background-color: #f5f5f5; border-radius: 4px; font-size: 11px;">
            <strong>Observações:</strong><br/>
            ${order.observations}
          </div>
        ` : ''}
      </div>

    </body>
  </html>
  `
}
