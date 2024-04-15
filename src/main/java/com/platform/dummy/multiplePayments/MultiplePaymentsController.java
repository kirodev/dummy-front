package com.platform.dummy.multiplePayments;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/multiple-payments")
public class MultiplePaymentsController {

    private final MultiplePaymentsRepository multiplePaymentsRepository;

    @Autowired
    public MultiplePaymentsController(MultiplePaymentsRepository multiplePaymentsRepository) {
        this.multiplePaymentsRepository = multiplePaymentsRepository;
    }

    @GetMapping
    public List<MultiplePayments> getAllMultiplePayments() {
        return multiplePaymentsRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<MultiplePayments> getMultiplePaymentById(@PathVariable Long id) {
        Optional<MultiplePayments> multiplePaymentsOptional = multiplePaymentsRepository.findById(id);
        return multiplePaymentsOptional.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public MultiplePayments createMultiplePayment(@RequestBody MultiplePayments multiplePayments) {
        return multiplePaymentsRepository.save(multiplePayments);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MultiplePayments> updateMultiplePayment(@PathVariable Long id, @RequestBody MultiplePayments updatedMultiplePayments) {
        Optional<MultiplePayments> optionalMultiplePayments = multiplePaymentsRepository.findById(id);
        if (optionalMultiplePayments.isPresent()) {
            MultiplePayments existingMultiplePayments = optionalMultiplePayments.get();

            // Check if the updated multiplier is not null and not already zero
            Integer updatedMultiplier = updatedMultiplePayments.getMultiplier();
            if (updatedMultiplier != null && updatedMultiplier > 0) {
                // Decrease the multiplier by 1
                int newMultiplier = updatedMultiplier - 1;
                existingMultiplePayments.setMultiplier(newMultiplier);
            }

            existingMultiplePayments.setLicensee(updatedMultiplePayments.getLicensee());

            // Save the updated entity
            MultiplePayments savedMultiplePayments = multiplePaymentsRepository.save(existingMultiplePayments);
            return ResponseEntity.ok(savedMultiplePayments);
        } else {
            return ResponseEntity.notFound().build();
        }
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMultiplePayment(@PathVariable Long id) {
        Optional<MultiplePayments> optionalMultiplePayments = multiplePaymentsRepository.findById(id);
        if (optionalMultiplePayments.isPresent()) {
            multiplePaymentsRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
