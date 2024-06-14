package com.platform.dummy.AnnualRevenues;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AnnualRevenueService {

    @Autowired
    private AnnualRevenuesRepository annualRevenuesRepository;

    public List<AnnualRevenues> findAll() {
        return annualRevenuesRepository.findAll();
    }

    public Optional<AnnualRevenues> findById(Integer id) {
        return annualRevenuesRepository.findById(id);
    }

    public AnnualRevenues save(AnnualRevenues annualRevenue) {
        return annualRevenuesRepository.save(annualRevenue);
    }

    public void deleteById(Integer id) {
        annualRevenuesRepository.deleteById(id);
    }
}
