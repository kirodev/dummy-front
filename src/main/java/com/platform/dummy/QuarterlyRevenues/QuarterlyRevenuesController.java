package com.platform.dummy.QuarterlyRevenues;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/quarterly-revenues")
public class QuarterlyRevenuesController {

    @Autowired
    private QuarterlyRevenuesRepository quarterlyRevenuesRepository;

    @GetMapping
    public List<QuarterlyRevenues> getAllQuarterlyRevenues() {
        return quarterlyRevenuesRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuarterlyRevenues> getQuarterlyRevenueById(@PathVariable Integer id) {
        Optional<QuarterlyRevenues> quarterlyRevenue = quarterlyRevenuesRepository.findById(id);
        if (quarterlyRevenue.isPresent()) {
            return ResponseEntity.ok(quarterlyRevenue.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public QuarterlyRevenues createQuarterlyRevenue(@RequestBody QuarterlyRevenues quarterlyRevenue) {
        return quarterlyRevenuesRepository.save(quarterlyRevenue);
    }

    @PutMapping("/{id}")
    public ResponseEntity<QuarterlyRevenues> updateQuarterlyRevenue(@PathVariable Integer id, @RequestBody QuarterlyRevenues quarterlyRevenueDetails) {
        Optional<QuarterlyRevenues> quarterlyRevenue = quarterlyRevenuesRepository.findById(id);
        if (quarterlyRevenue.isPresent()) {
            QuarterlyRevenues updatedQuarterlyRevenue = quarterlyRevenue.get();
            updatedQuarterlyRevenue.setLicensor(quarterlyRevenueDetails.getLicensor());
            updatedQuarterlyRevenue.setYear(quarterlyRevenueDetails.getYear());
            updatedQuarterlyRevenue.setQuarter(quarterlyRevenueDetails.getQuarter());
            updatedQuarterlyRevenue.setRevenue(quarterlyRevenueDetails.getRevenue());
            return ResponseEntity.ok(quarterlyRevenuesRepository.save(updatedQuarterlyRevenue));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuarterlyRevenue(@PathVariable Integer id) {
        if (quarterlyRevenuesRepository.existsById(id)) {
            quarterlyRevenuesRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
