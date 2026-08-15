import puppeteer from 'puppeteer'
import { orderTemplate } from '../templates/order.template.js'

export async function generateOrderPDF(order, company) {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  const html = orderTemplate(order, company)

  await page.setContent(html, { waitUntil: 'networkidle0' })

  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: `<div></div>`,
    footerTemplate: `
      <div style="font-size:11px; width:100%; text-align:center;">
        Página <span class="pageNumber"></span> de 
        <span class="totalPages"></span>
      </div>
    `,
    margin: {
      top: '20mm',
      bottom: '25mm'
    }
  })

  await browser.close()

  return pdf
}
