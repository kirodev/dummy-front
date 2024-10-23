package com.platform.dummy.equationsPayments;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/equations")
public class EquationController {

    @Autowired
    private EquationService equationService;

    @GetMapping
    public List<Equation> getAllEquations() {
        return equationService.getAllEquations();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Equation> getEquationById(@PathVariable Integer id) {
        Optional<Equation> equation = equationService.getEquationById(id);
        return equation.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public Equation createEquation(@RequestBody Equation equation) {
        return equationService.saveEquation(equation);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Equation> updateEquation(@PathVariable Integer id, @RequestBody Equation equationDetails) {
        Optional<Equation> equationOptional = equationService.getEquationById(id);

        if (equationOptional.isPresent()) {
            Equation equation = equationOptional.get();

            // Update fields
            equation.setSnippetId(equationDetails.getSnippetId());
            equation.setLicensor(equationDetails.getLicensor());
            equation.setLicensee(equationDetails.getLicensee());
            equation.setYear(equationDetails.getYear());
            equation.setYearlyQuarters(equationDetails.getYearlyQuarters());
            equation.setDetails(equationDetails.getDetails());
            equation.setEqType(equationDetails.getEqType());
            equation.setEquation(equationDetails.getEquation());
            equation.setEqResult(equationDetails.getEqResult());
            equation.setAdvEqType(equationDetails.getAdvEqType());
            equation.setAdvEquation(equationDetails.getAdvEquation());
            equation.setCoef(equationDetails.getCoef());
            equation.setAdvEqTypeResult(equationDetails.getAdvEqTypeResult());
            equation.setAdvEqResult(equationDetails.getAdvEqResult());
            equation.setRoyaltyRates(equationDetails.getRoyaltyRates());

            Equation updatedEquation = equationService.saveEquation(equation);
            return ResponseEntity.ok(updatedEquation);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEquation(@PathVariable Integer id) {
        equationService.deleteEquation(id);
        return ResponseEntity.noContent().build();
    }
}
