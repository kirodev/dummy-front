package com.platform.dummy.multiplePayments;

import com.platform.dummy.multipleLicenses.MultipleLicenses;
import org.json.JSONException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.json.JSONObject;

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
    public ResponseEntity<List<MultiplePayments>> getAllMultiplePayments() {
        List<MultiplePayments> multiplepayments = multiplePaymentsRepository.findAll();
        return ResponseEntity.ok(multiplepayments);
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

            // Set modified with the ID
            existingMultiplePayments.setModified(String.valueOf(id));

            // Check if the updated multiplier is not null and not already zero
            Integer updatedMultiplier = updatedMultiplePayments.getMultiplier();
            if (updatedMultiplier != null && updatedMultiplier > 0) {
                // Decrease the multiplier by 1
                int newMultiplier = updatedMultiplier - 1;
                existingMultiplePayments.setMultiplier(newMultiplier);
            }

            existingMultiplePayments.setLicensee(updatedMultiplePayments.getLicensee());

            // Set the comment
            existingMultiplePayments.setComment(updatedMultiplePayments.getComment());

            // Save the updated entity
            MultiplePayments savedMultiplePayments = multiplePaymentsRepository.save(existingMultiplePayments);
            return ResponseEntity.ok(savedMultiplePayments);
        } else {
            return ResponseEntity.notFound().build();
        }
    }


    @PutMapping("/{id}/undoP")
    public ResponseEntity<MultiplePayments> undoUpdateMultiplePayment(@PathVariable("id") Long id, @RequestBody String comment) throws JSONException {
        // Here, the 'comment' parameter will directly contain the string value of the comment
        Optional<MultiplePayments> optionalPayment = multiplePaymentsRepository.findById(id);
        if (optionalPayment.isPresent()) {
            MultiplePayments existingPayment = optionalPayment.get();

            // Retrieve the current licensee value
            String licensee = existingPayment.getLicensee();

            // Remove the last value after the last " | " delimiter
            int lastIndex = licensee.lastIndexOf(" | ");
            if (lastIndex != -1) {
                licensee = licensee.substring(0, lastIndex);
            } else {
                // If there's no " | " delimiter, set licensee to an empty string
                licensee = "";
            }

            // Update the payment with the modified licensee
            existingPayment.setLicensee(licensee);

            // Increment the multiplier by 1 if it's not null
            Integer multiplier = existingPayment.getMultiplier();
            if (multiplier != null) {
                existingPayment.setMultiplier(multiplier + 1);
            }

            // Set modified to null to indicate the restoration of the original state
            existingPayment.setModified(null);

            // Create a JSONObject from the comment string
            JSONObject commentJson = new JSONObject(comment);

            // Extract the comment value from the JSONObject
            String extractedComment = commentJson.getString("comment");

            // Set the extracted comment to the existingPayment
            existingPayment.setComment(extractedComment);

            // Save the updated payment entity to the database
            MultiplePayments updatedPayment = multiplePaymentsRepository.save(existingPayment);

            // Return the updated payment entity
            return ResponseEntity.ok(updatedPayment);
        }
        return ResponseEntity.notFound().build();
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

    @PutMapping("/{id}/MPmappingId")
    public ResponseEntity<MultiplePayments> updateMPMappingId(
            @PathVariable("id") Long id,
            @RequestBody String mappingId) {
        // Assuming MultipleLicensesRepository is autowired
        Optional<MultiplePayments> optionalMultiplePayments = multiplePaymentsRepository.findById(id);
        if (optionalMultiplePayments.isPresent()) {
            MultiplePayments multiplePayments = optionalMultiplePayments.get();
            multiplePayments.setMapping_id(mappingId); // Set the mapping ID
            // Save the updated entity
            MultiplePayments updatedMultiplePayments = multiplePaymentsRepository.save(multiplePayments);
            return new ResponseEntity<>(updatedMultiplePayments, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    @PutMapping("/{id}/details") // Adjust the mapping to match the correct URL
    public ResponseEntity<MultiplePayments> updateDetails(
            @PathVariable("id") Long id,
            @RequestParam("details") String updatedDetails) {
        Optional<MultiplePayments> optionalMultiplePayments = multiplePaymentsRepository.findById(id);
        if (optionalMultiplePayments.isPresent()) {
            MultiplePayments multiplepayments = optionalMultiplePayments.get();
            multiplepayments.setDetails(updatedDetails); // Set the updated details
            MultiplePayments updatedPayments = multiplePaymentsRepository.save(multiplepayments);
            return new ResponseEntity<>(updatedPayments, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }



}
