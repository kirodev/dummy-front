import { Component, OnInit } from '@angular/core';
import { Payment, EquationsPaymentsService, AnnualRevenues } from '../equations-payments.service';
import { catchError, tap, map, switchMap, concatMap } from 'rxjs/operators';
import { forkJoin, Observable, of } from 'rxjs';

@Component({
  selector: 'app-equations-payments',
  templateUrl: './equations-payments.component.html',
  styleUrls: ['./equations-payments.component.css']
})
export class EquationsPaymentsComponent implements OnInit {
  payments: Payment[] = [];
  annualRevenues: AnnualRevenues[] = [];
  selectedPayment: Payment | null = null;
  error: string | null = null;
  debugInfo: string = '';

  constructor(private equationsPaymentsService: EquationsPaymentsService) { }

  ngOnInit(): void {
    this.loadPaymentsAndRevenues();
  }

  loadPaymentsAndRevenues(): void {
    forkJoin({
      payments: this.equationsPaymentsService.getPayments(),
      annualRevenues: this.equationsPaymentsService.getAllAnnualRevenues()
    }).pipe(
      tap(data => {
        console.log('Raw data from service:', data);
        this.debugInfo += `Raw data from service: ${JSON.stringify(data)}\n`;
      }),
      switchMap(({ payments, annualRevenues }) => {
        this.annualRevenues = annualRevenues;
        const processedPayments = payments.map(payment => this.processPayment(payment));
        return this.applyRevenuesToPayments(processedPayments);
      }),
      catchError(error => {
        console.error('Error in loadPaymentsAndRevenues:', error);
        this.debugInfo += `Error in loadPaymentsAndRevenues: ${JSON.stringify(error)}\n`;
        this.error = 'Failed to load or update payments and annual revenues';
        return of([]);
      })
    ).subscribe({
      next: finalProcessedPayments => {
        if (finalProcessedPayments && finalProcessedPayments.length > 0) {
          this.payments = finalProcessedPayments;
          console.log('Final processed payments:', this.payments);
          this.debugInfo += `Final processed payments: ${JSON.stringify(this.payments)}\n`;
        } else {
          console.log('No payments data received');
          this.debugInfo += 'No payments data received\n';
          this.error = 'No payments found';
        }
      },
      error: error => {
        console.error('Error in subscribe:', error);
        this.debugInfo += `Error in subscribe: ${JSON.stringify(error)}\n`;
        this.error = 'Failed to load or update payments';
      }
    });
  }

  private processPayment(payment: Payment): Payment {
    const dataValues = {
      licensee: payment.licensee || '',
      licensor: payment.licensor || '',
      year: payment.year ? payment.year.toString() : '',
      quarter: payment.quarter || ''
    };

    return {
      ...payment,
      equation: this.replaceVariables(payment.equation || '', dataValues),
      adv_equation: this.replaceVariables(payment.adv_equation || '', dataValues),
      adv_eq_result: this.replaceVariables(payment.adv_eq_result || '', dataValues)
    };
  }

  private applyRevenuesToPayments(payments: Payment[]): Observable<Payment[]> {
    return of(payments).pipe(
      concatMap(paymentsArray =>
        forkJoin(paymentsArray.map(payment => this.processAndUpdatePayment(payment)))
      )
    );
  }
  private processAndUpdatePayment(payment: Payment): Observable<Payment> {
    if (payment.adv_eq_type_result === 'TRY' && payment.licensor && payment.year) {
      const paymentYear = this.parseYear(payment.year);
      if (paymentYear !== null) {
        const matchingRevenue = this.annualRevenues.find(
          rev => rev.licensor === payment.licensor && rev.year === paymentYear
        );
        if (matchingRevenue) {
          const coef = this.parseCoef(payment.coef);
          if (coef !== null) {
            payment.results = coef * matchingRevenue.total_revenue;
            console.log(`Calculated results: ${payment.results} (coef: ${coef} * total_revenue: ${matchingRevenue.total_revenue}) for ${payment.licensor}, ${paymentYear}`);
            this.debugInfo += `Calculated results: ${payment.results} (coef: ${coef} * total_revenue: ${matchingRevenue.total_revenue}) for ${payment.licensor}, ${paymentYear}\n`;

            // Update the payment in the database
            return this.equationsPaymentsService.updatePayment(payment.id!, payment).pipe(
              catchError(error => {
                console.error(`Error updating payment ${payment.id}:`, error);
                this.debugInfo += `Error updating payment ${payment.id}: ${JSON.stringify(error)}\n`;
                return of(payment);
              })
            );
          } else {
            console.error(`Invalid coef for payment: ${payment.id}, coef: ${payment.coef}`);
            this.debugInfo += `Invalid coef for payment: ${payment.id}, coef: ${payment.coef}\n`;
          }
        } else {
          console.log(`No revenue found for ${payment.licensor}, ${paymentYear}`);
          this.debugInfo += `No revenue found for ${payment.licensor}, ${paymentYear}\n`;
        }
      } else {
        console.error(`Invalid year format for payment: ${payment.id}, year: ${payment.year}`);
        this.debugInfo += `Invalid year format for payment: ${payment.id}, year: ${payment.year}\n`;
      }
    }
    return of(payment);
  }
  private updatePaymentsInDatabase(payments: Payment[]): Observable<Payment[]> {
    const updatedPayments = payments.filter(payment => payment.results !== undefined);
    if (updatedPayments.length === 0) {
      return of(payments);
    }
    return this.equationsPaymentsService.updatePaymentResults(updatedPayments).pipe(
      map(() => payments),
      catchError(error => {
        console.error('Error updating payments in database:', error);
        this.debugInfo += `Error updating payments in database: ${JSON.stringify(error)}\n`;
        return of(payments);
      })
    );
  }

  private parseYear(year: string | number): number | null {
    if (typeof year === 'number') {
      return year;
    }
    const parsedYear = parseInt(year, 10);
    return isNaN(parsedYear) ? null : parsedYear;
  }

  private parseCoef(coef: string | number | undefined): number | null {
    if (typeof coef === 'number') {
      return coef;
    }
    if (typeof coef === 'string') {
      const parsedCoef = parseFloat(coef);
      return isNaN(parsedCoef) ? null : parsedCoef;
    }
    return null;
  }

  replaceVariables(equation: string, dataValues: { licensee: string, licensor: string, year: string, quarter?: string }): string {
    let result = equation;

    // Replace placeholders while keeping brackets
    result = result
      .replace(/\[licensee\]/g, `[${dataValues.licensee}]`)
      .replace(/\[licensor\]/g, `[${dataValues.licensor}]`)
      .replace(/\[year\]/g, `[${dataValues.year}]`)
      .replace(/\[quarter\]/g, `[${dataValues.quarter || ''}]`); // Replace with an empty string if quarter is undefined

    return result;
  }

  selectPayment(payment: Payment): void {
    this.selectedPayment = { ...payment };
  }
}
