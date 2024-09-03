import { Component, OnInit } from '@angular/core';
import { Equation, EquationsPaymentsService } from '../equations-payments.service';


@Component({
  selector: 'app-equations-payments',
  templateUrl: './equations-payments.component.html',
  styleUrls: ['./equations-payments.component.css']
})
export class EquationsPaymentsComponent implements OnInit {

  equations: Equation[] = [];
  selectedEquation?: Equation;

  constructor(private equationsPaymentsService: EquationsPaymentsService) { }

  ngOnInit(): void {
    this.loadEquations();
  }

  loadEquations(): void {
    this.equationsPaymentsService.getEquations().subscribe(data => {
        this.equations = data.map(equation => {
            let licensee = '';
            let licensor = '';
            let year = 0; // Default to 0 if year is undefined
            let quarter: string | undefined;

            try {
                // Parse combined data from equation.advEquation
                const parsedAdvEquation = this.parseCombinedData(equation.advEquation || '');
                licensee = parsedAdvEquation.licensee;
                licensor = parsedAdvEquation.licensor;
                year = parsedAdvEquation.year ?? 0; // Provide default value
                quarter = parsedAdvEquation.quarter;

                // Handle the same for equation.equation if needed
                const parsedEquation = this.parseCombinedData(equation.equation || '');
                licensee = licensee || parsedEquation.licensee;
                licensor = licensor || parsedEquation.licensor;
// Corrected line with parentheses to ensure correct evaluation
                year = (year || parsedEquation.year) ?? 0; // Provide default value
                quarter = quarter || parsedEquation.quarter;

                const dataValues = {
                    licensee: licensee,
                    licensor: licensor,
                    year, // Use the corrected year
                    quarter // Can be undefined if not parsed
                };

                return {
                    ...equation,
                    advEquation: this.equationsPaymentsService.generateEquation(equation.advEquation || '', dataValues),
                    equation: this.equationsPaymentsService.generateEquation(equation.equation || '', dataValues)
                };
            } catch (error) {
                if (error instanceof Error) {
                    console.error('Error processing equations:', error.message);
                } else {
                    console.error('An unknown error occurred:', error);
                }
                return equation; // Return original equation on error
            }
        });
    });
}








private parseCombinedData(data: string): { licensee: string, licensor: string, year?: number, quarter?: string } {
  // Split the input string by commas and check for expected length
  const parts = data.split(',');

  // Check if the input is valid
  if (parts.length < 3) {
      console.error('Invalid format: Not enough parts');
      return { licensee: '', licensor: '', year: undefined, quarter: undefined };
  }

  const licensee = parts[0].trim();
  const licensor = parts[1].trim();
  const lastPart = parts[2].trim();

  // Extract year and quarter
  const yearMatch = lastPart.match(/^(\d{4})/);
  const quarterMatch = lastPart.match(/Q[1-4]$/);

  const year = yearMatch ? parseInt(yearMatch[1], 10) : undefined;
  const quarter = quarterMatch ? quarterMatch[0] : undefined;

  return {
      licensee,
      licensor,
      year,
      quarter
  };
}






  selectEquation(equation: Equation): void {
    this.selectedEquation = { ...equation };
  }

  createEquation(): void {
    if (this.selectedEquation) { // Ensure selectedEquation is defined
      this.equationsPaymentsService.createEquation(this.selectedEquation).subscribe(() => {
        this.loadEquations();
        this.clearForm();
      });
    } else {
      // Handle the case where selectedEquation is not defined
      console.error('Selected equation is not defined');
    }
  }


  updateEquation(): void {
    if (this.selectedEquation?.id) {  // Check if selectedEquation and selectedEquation.id are defined
      this.equationsPaymentsService.updateEquation(this.selectedEquation.id, this.selectedEquation).subscribe(() => {
        this.loadEquations();
        this.clearForm();
      });
    } else {
      // Handle the case where selectedEquation is not defined
      console.error('Selected equation is not defined or has no ID');
    }
  }

  deleteEquation(id: number): void {
    this.equationsPaymentsService.deleteEquation(id).subscribe(() => {
      this.loadEquations();
    });
  }

  clearForm(): void {
    this.selectedEquation = {
      snippetId: 0,
      licensor: '',
      licensee: '',
      year: 0,
      yearlyQuarters: '',
      details: '',
      eqType: '',
      equation: '',
      eqResult: 0,
      advEqType: '',
      advEquation: '',
      coef: 0,
      advEqTypeResult: '',
      advEqResult: '', // Ensure this is a number
      royaltyRates: ''
    };
  }

}
