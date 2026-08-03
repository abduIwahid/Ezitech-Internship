import os
import re
from fpdf import FPDF

class InternshipReportPDF(FPDF):
    def header(self):
        # Optional: Add a top header line if needed
        pass
        
    def footer(self):
        # Position at 1.5 cm from bottom
        self.set_y(-15)
        self.set_font('Times', 'I', 9)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')

def clean_text(text):
    # Replace emojis and common non-latin1 typographic characters
    replacements = {
        '📅': '',
        '🟢': '[Completed]',
        '🟡': '[In Progress]',
        '⚪': '[Pending]',
        '📝': '',
        '—': '-',
        '–': '-',
        '’': "'",
        '‘': "'",
        '“': '"',
        '”': '"',
        '•': '*',
        '✅': '[Yes]',
    }
    for k, v in replacements.items():
        text = text.replace(k, v)
    
    # Strip any remaining emojis or non-latin1 characters to avoid FPDF errors
    cleaned = []
    for char in text:
        try:
            char.encode('latin-1')
            cleaned.append(char)
        except UnicodeEncodeError:
            pass
    return "".join(cleaned)

def convert_md_to_pdf(md_path, pdf_path):
    pdf = InternshipReportPDF()
    pdf.set_margins(20, 20, 20) # 20mm margins
    pdf.add_page()
    
    # Set spacing to 1.5 equivalent (1.5 * font_size)
    line_height = 8.0 # for size 12 font
    
    with open(md_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    in_list = False
    
    for line in lines:
        cleaned_line = clean_text(line)
        stripped = cleaned_line.strip()
        
        # Skip empty lines but add a small spacing
        if not stripped:
            pdf.ln(4)
            continue
            
        # Headers
        if stripped.startswith('# '):
            pdf.ln(6)
            pdf.set_font('Times', 'B', 16)
            pdf.write(10, stripped[2:] + '\n')
            pdf.ln(4)
            continue
        elif stripped.startswith('## '):
            pdf.ln(5)
            pdf.set_font('Times', 'B', 14)
            pdf.write(9, stripped[3:] + '\n')
            pdf.ln(3)
            continue
        elif stripped.startswith('### '):
            pdf.ln(4)
            pdf.set_font('Times', 'B', 12)
            pdf.write(8, stripped[4:] + '\n')
            pdf.ln(2)
            continue
            
        # Horizontal rule
        if stripped == '---':
            pdf.ln(4)
            # Draw line
            pdf.line(pdf.get_x(), pdf.get_y(), pdf.get_x() + 170, pdf.get_y())
            pdf.ln(4)
            continue
            
        # Bullet list items
        if stripped.startswith('* ') or stripped.startswith('- '):
            pdf.set_x(25) # indent bullet
            pdf.set_font('Times', '', 12)
            pdf.write(line_height, '- ') # use clean dash
            
            # Print rest of the line with inline formatting
            content = stripped[2:]
            parts = content.split('**')
            is_bold = False
            for part in parts:
                if is_bold:
                    pdf.set_font('Times', 'B', 12)
                else:
                    pdf.set_font('Times', '', 12)
                pdf.write(line_height, part)
                is_bold = not is_bold
            pdf.write(line_height, '\n')
            continue
            
        # Standard paragraphs
        parts = stripped.split('**')
        is_bold = False
        for part in parts:
            if is_bold:
                pdf.set_font('Times', 'B', 12)
            else:
                pdf.set_font('Times', '', 12)
            pdf.write(line_height, part)
            is_bold = not is_bold
        pdf.write(line_height, '\n')
        
    pdf.output(pdf_path)
    print(f"Successfully converted {md_path} to {pdf_path}")

if __name__ == '__main__':
    md_file = 'docs/WEEK_1_2_INTERNSHIP_REPORTS.md'
    pdf_file = 'docs/WEEK_1_2_INTERNSHIP_REPORTS.pdf'
    
    if os.path.exists(md_file):
        convert_md_to_pdf(md_file, pdf_file)
    else:
        print(f"Error: {md_file} not found!")
