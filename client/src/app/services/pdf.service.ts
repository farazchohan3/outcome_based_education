import { DatePipe, formatDate, formatPercent } from '@angular/common';
import { Injectable } from '@angular/core';
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor() { }

  getImageFromUrl(imageUrl: string) {
    return new Promise((resolve, reject) => {
      let image = new Image();
      image.setAttribute("crossOrigin", "anonymous");
      image.onerror = (error) => {
        // console.log(error);
        reject(error);
      };
      image.style.borderRadius = "50%";
      image.onload = () => {
        let canvas = document.createElement("canvas");
        canvas.height = image.height;
        canvas.width = image.width;
        canvas.style.borderRadius = "50%";
        let ctx = <any> canvas.getContext("2d");
        ctx.drawImage(image, 0, 0);

        let dataUrl = canvas.toDataURL("image/png");
        resolve(dataUrl);
      };
      image.src = imageUrl;
    });
  }

  getPdfContent({ courseName, curriculumName, ciaMarks, eseMarks, directAttainment, indirectAttainment, totalAttianment }: {
    courseName: string,
    curriculumName: string,
    ciaMarks: any[],
    eseMarks: any[],
    directAttainment: any[],
    indirectAttainment: any[],
    totalAttianment: any[]
  }) {
    const dateTimeString = new DatePipe('en-US').transform(new Date(), 'dd/MM/yyyy hh:mm:ss a');
    const ciaBody = ciaMarks.map((e, idx) => [
      { text: idx + 1, margin: [0, 2] },
      { text: e.coCode, margin: [0, 2] },
      { text: formatPercent(e.attaimentPercentage, 'en-IN', '1.2'), margin: [0, 2], bold: true },
      { text: e.attainmentLevel, margin: [0, 2], bold: true },
      { text: e.attainment, margin: [0, 2], bold: true },
    ]);

    const eseBody = eseMarks.map((e, idx) => [
      { text: idx + 1, margin: [0, 2] },
      { text: e.coCode, margin: [0, 2] },
      { text: formatPercent(e.attaimentPercentage, 'en-IN', '1.2'), margin: [0, 2], bold: true },
      { text: e.attainmentLevel, margin: [0, 2], bold: true },
      { text: e.attainment, margin: [0, 2], bold: true },
    ]);

    const directAttainmentBody = directAttainment.map((e, idx) => [
      { text: idx + 1, margin: [0, 2] },
      { text: e.coCode, margin: [0, 2] },
      { text: formatPercent(e.ciaPercentage, 'en-IN', '1.2'), margin: [0, 2], bold: true },
      { text: formatPercent(e.esePercentage, 'en-IN', '1.2'), margin: [0, 2], bold: true },
      { text: formatPercent(e.totalAttainment / 100, 'en-IN', '1.2'), margin: [0, 2], bold: true },
      { text: e.attainmentLevel, margin: [0, 2], bold: true },
    ]);

    const indirectAttainmentBody = indirectAttainment.map((e, idx) => [
      { fontSize: 10, text: e.coCode, margin: [0, 2] },
      { fontSize: 10, text: `${e['1'].count} |  ${formatPercent(e['1'].count / e.totalStudents, 'en-IN', '1.2')}`, margin: [0, 2], bold: true },
      { fontSize: 10, text: `${e['2'].count} |  ${formatPercent(e['2'].count / e.totalStudents, 'en-IN', '1.2')}`, margin: [0, 2], bold: true },
      { fontSize: 10, text: `${e['3'].count} |  ${formatPercent(e['3'].count / e.totalStudents, 'en-IN', '1.2')}`, margin: [0, 2], bold: true },
      { fontSize: 10, text: `${e['4'].count} |  ${formatPercent(e['4'].count / e.totalStudents, 'en-IN', '1.2')}`, margin: [0, 2], bold: true },
      { fontSize: 10, text: `${e['5'].count} |  ${formatPercent(e['5'].count / e.totalStudents, 'en-IN', '1.2')}`, margin: [0, 2], bold: true },
      { fontSize: 10, text: e.totalAvg, margin: [0, 2], bold: true },
      { fontSize: 10, text: e.attainmentLevel, margin: [0, 2], bold: true },
    ]);

    const totalAttainmentBody = totalAttianment.map((e, idx) => [
      { text: idx + 1, margin: [0, 2] },
      { text: e.coCode, margin: [0, 2] },
      { text: formatPercent(e.directAttainment / 100, 'en-IN', '1.2'), margin: [0, 2], bold: true },
      { text: formatPercent(e.indirectAttainment, 'en-IN', '1.2'), margin: [0, 2], bold: true },
      { text: e.totalCOAttainment, margin: [0, 2], bold: true },
      { text: e.attainmentLevel, margin: [0, 2], bold: true },
    ]);

    const getTeacherName = () => {
      let user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.firstName + " " + user.lastName;
    }

    const docRef = pdfMake.createPdf({
      header: (currentPage, pageCount, pageSize) => currentPage === 1 ? [] : [
        { text: 'Quaid-I-Azam University, Islamabad', bold: true, alignment: 'center', fontSize: 12, margin: [0, 7, 0, 0] },
        { text: 'Outcome Based Education Report', bold: true, alignment: 'center', fontSize: 10, margin: [0, 2, 0, 2], color: "#707070" },
        { canvas: [{ type: "rect", x: 40, y: 0, w: pageSize.width - 75, h: 0, lineWidth: 1, lineColor: "#000", margin: [0, -4, 0, 0 ] }]},
      ],
      footer: (currentPage, pageCount, pageSize) => currentPage === 1 ? [] : [
        { canvas: [{ type: "rect", x: 40, y: 10, w: pageSize.width - 75, h: 0, lineWidth: 1, lineColor: "#000" }]},
        {
          columns: [
            { text: 'Generated On: ' + dateTimeString, color: '#707070', fontSize: 10 },
            { text: 'Page ' + (currentPage - 1).toString() + " of " + (pageCount - 1).toString(), alignment: 'right', color: "#707070", fontSize: 10 }
          ],
          margin: [38, 4]
        }
      ],
      content: [
        // Title Page
        { alignment: 'center', text: 'Quaid-I-Azam University', margin: [0, 240, 0, 0], fontSize: 30 },
		    { alignment: 'center', text: 'Islamabad', fontSize: 24 },
		    { alignment: 'center', text: 'Outcome Based Education Report', margin: [0, 70, 0, 0], fontSize: 18, color: "#707070" },
		    { alignment: 'center', text:  courseName, fontSize: 20, margin: [0, 4, 0 ,0] },
        { alignment: 'center', text: 'Batch: ' + curriculumName, fontSize: 18, margin: [0, 4, 0 ,0], color: "#707070" },
        { alignment: 'center', text: 'By: ' + getTeacherName(), fontSize: 18, margin: [0, 4, 0 ,0], color: "#707070", pageBreak: 'after' },

        // Page Content
        { alignment: 'center', text: 'CIA Marks', margin: [0, 20, 0, 10], fontSize: 18, bold: true },
        {
          layout: 'lightHorizontalLines',
          table: {
              headerRows: 1,
              widths: [40, 100, 100, 100, '*'],
              body: [
                ['Sr. No', 'CO Code', 'Attainment (%)', 'Attainment Level', 'Remarks'],
                ...ciaBody
              ]
          }
        },
        { alignment: 'center', text: 'ESE Marks', margin: [0, 20, 0, 10], fontSize: 18, bold: true },
        {
          layout: 'lightHorizontalLines',
          table: {
              headerRows: 1,
              widths: [40, 100, 100, 100, '*'],
              body: [
                ['Sr. No', 'CO Code', 'Attainment (%)', 'Attainment Level', 'Remarks'],
                ...eseBody
              ]
          },
        },
        { alignment: 'center', text: 'Direct Attainment', margin: [0, 20, 0, 10], fontSize: 18, bold: true },
        {
          layout: 'lightHorizontalLines',
          table: {
              headerRows: 1,
              widths: [40, 60, '*', '*', '*', '*'],
              body: [
                ['Sr. No', 'CO Code', 'CIA (40%)', 'ESE (60%)', 'Attainment (%)', 'Level'],
                ...directAttainmentBody
              ]
          },
          pageBreak: 'after'
        },
        { alignment: 'center', text: 'In-Direct Attainment', margin: [0, 20, 0, 10], fontSize: 18, bold: true },
        {
          layout: 'lightHorizontalLines',
          table: {
              headerRows: 1,
              widths: [40,'*', '*', '*', '*', '*', '*', '*'],
              body: [
                ['CO Code', '1 | %', '2 | %', '3 | %', '4 | %', '5 | %', 'Total Avg', 'Level'],
                ...indirectAttainmentBody
              ]
          },
        },
        { alignment: 'center', text: 'Total Attainment', margin: [0, 20, 0, 10], fontSize: 18, bold: true },
        {
          layout: 'lightHorizontalLines',
          table: {
              headerRows: 1,
              widths: [40, 60, '*', '*', '*', '*'],
              body: [
                ['Sr. No', 'CO Code', 'Direct', 'In-Direct', 'Attainment (%)', 'Level'],
                ...totalAttainmentBody
              ]
          }
        },
      ]
    });

    return docRef;
  }

}
