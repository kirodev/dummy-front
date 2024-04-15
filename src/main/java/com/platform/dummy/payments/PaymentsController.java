package com.platform.dummy.payments;

import com.platform.dummy.licenses.Licenses;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/payments")
public class PaymentsController {

    private final PaymentsRepository paymentsRepository;

    @Autowired
    public PaymentsController(PaymentsRepository paymentsRepository) {
        this.paymentsRepository = paymentsRepository;
    }

    @GetMapping
    public List<Payments> getAllPayments() {
        return paymentsRepository.findAll();
    }

    @GetMapping("/{id}")
    public Payments getPaymentById(@PathVariable Long id) {
        return paymentsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found with id: " + id));
    }

    @PostMapping
    public Payments createPayment(@RequestBody Payments payments) {
        return paymentsRepository.save(payments);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Payments> updatePayment(@PathVariable("id") Long id, @RequestBody Payments licenseDetails) {
        Optional<Payments> optionalPayment = paymentsRepository.findById(id);
        if (optionalPayment.isPresent()) {
            Payments payments = optionalPayment.get();

            // Check if the current licensee is "Unknown" or if it's any other value
            if (payments.getLicensee().equals("Unknown")) {
                // Update the licensee and set the modified column only if it's "Unknown"
                payments.setLicensee(licenseDetails.getLicensee());
                payments.setModified(String.valueOf(id)); // Set modified column
            } else {
                // Update the licensee for all other cases
                payments.setLicensee(licenseDetails.getLicensee());
            }

            // Save the updated license entity to the database
            Payments updatedPayment = paymentsRepository.save(payments);

            return new ResponseEntity<>(updatedPayment, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }


    @PutMapping("/{id}/undo")
    public ResponseEntity<Payments> undoUpdatePayment(@PathVariable("id") Long id) {
        Optional<Payments> optionalPayment = paymentsRepository.findById(id);
        if (optionalPayment.isPresent()) {
            Payments existingPayment = optionalPayment.get();

            // Revert the licensee field to "Unknown"
            existingPayment.setLicensee("Unknown");

            // Save the updated payment entity to the database
            Payments updatedPayment = paymentsRepository.save(existingPayment);

            return ResponseEntity.ok(updatedPayment);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public void deletePayment(@PathVariable Long id) {
        paymentsRepository.deleteById(id);
    }
}
