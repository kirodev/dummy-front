package com.platform.dummy.equationsPayments;




import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EquationService {

    @Autowired
    private EquationRepository equationRepository;

    public List<Equation> getAllEquations() {
        return equationRepository.findAll();
    }

    public Optional<Equation> getEquationById(Integer id) {
        return equationRepository.findById(id);
    }

    public Equation saveEquation(Equation equation) {
        return equationRepository.save(equation);
    }

    public void deleteEquation(Integer id) {
        equationRepository.deleteById(id);
    }

    // Add more service methods if needed
}
