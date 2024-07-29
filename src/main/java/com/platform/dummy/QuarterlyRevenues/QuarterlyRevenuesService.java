package com.platform.dummy.QuarterlyRevenues;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class QuarterlyRevenuesService {

    @Autowired
    private QuarterlyRevenuesRepository quarterlyRevenuesRespository;

    public List<QuarterlyRevenues> findAll() {
        return quarterlyRevenuesRespository.findAll();
    }

    public Optional<QuarterlyRevenues> findById(Integer id) {
        return quarterlyRevenuesRespository.findById(id);
    }

    public QuarterlyRevenues save(QuarterlyRevenues annualRevenue) {
        return quarterlyRevenuesRespository.save(annualRevenue);
    }

    public void deleteById(Integer id) {
        quarterlyRevenuesRespository.deleteById(id);
    }
}
