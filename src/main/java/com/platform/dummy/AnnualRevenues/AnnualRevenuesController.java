package com.platform.dummy.AnnualRevenues;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/annual-revenues")
public class AnnualRevenuesController {

    @Autowired
    private AnnualRevenuesRepository annualRevenuesRepository;

    @GetMapping
    public List<AnnualRevenues> getAllAnnualRevenues() {
        return annualRevenuesRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getAnnualRevenueById(@PathVariable Integer id) {
        Optional<AnnualRevenues> annualRevenues = annualRevenuesRepository.findById(id);
        if (annualRevenues.isPresent()) {
            return ResponseEntity.ok(annualRevenues.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public AnnualRevenues createAnnualRevenues(@RequestBody AnnualRevenues annualRevenue) {
        return annualRevenuesRepository.save(annualRevenue);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AnnualRevenues> updateAnnualRevenue(@PathVariable Integer id, @RequestBody AnnualRevenues annualRevenueDetails) {
        Optional<AnnualRevenues> annualRevenue = annualRevenuesRepository.findById(id);
        if (annualRevenue.isPresent()) {
            AnnualRevenues updatedAnnualRevenues = annualRevenue.get();
            updatedAnnualRevenues.setLicensor(annualRevenueDetails.getLicensor());
            updatedAnnualRevenues.setYear(annualRevenueDetails.getYear());
            updatedAnnualRevenues.setTotalRevenue(annualRevenueDetails.getTotalRevenue());
            updatedAnnualRevenues.setLicensingRevenue(annualRevenueDetails.getLicensingRevenue());
            updatedAnnualRevenues.setRecurringRevenue(annualRevenueDetails.getRecurringRevenue());
            updatedAnnualRevenues.setFixedFee(annualRevenueDetails.getFixedFee());
            updatedAnnualRevenues.setPerUnit(annualRevenueDetails.getPerUnit());
            updatedAnnualRevenues.setPastSales(annualRevenueDetails.getPastSales());
            return ResponseEntity.ok(annualRevenuesRepository.save(updatedAnnualRevenues));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAnnualRevenue(@PathVariable Integer id) {
        if (annualRevenuesRepository.existsById(id)) {
            annualRevenuesRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
