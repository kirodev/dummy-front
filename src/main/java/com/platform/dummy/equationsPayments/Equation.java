package com.platform.dummy.equationsPayments;

import javax.persistence.*;

@Entity
@Table(name = "equations")
public class Equation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "snippet_id")
    private Integer snippetId;

    @Column(name = "licensor")
    private String licensor;

    @Column(name = "licensee")
    private String licensee;

    @Column(name = "year")
    private Integer year;

    @Column(name = "yearly_quarters")
    private String yearlyQuarters;

    @Column(name = "details")
    private String details;

    @Column(name = "eq_type")
    private String eqType;

    @Column(name = "equation")
    private String equation;

    @Column(name = "eq_result")
    private Double eqResult;

    @Column(name = "adv_eq_type")
    private String advEqType;

    @Column(name = "adv_equation")
    private String advEquation;

    @Column(name = "coef")
    private Double coef;

    @Column(name = "adv_eq_type_result")
    private String advEqTypeResult;

    @Column(name = "adv_eq_result")
    private String advEqResult;

    @Column(name = "royalty_rates")
    private String royaltyRates;

    public Equation() {
    }

    public Equation(Integer id, Integer snippetId, String licensor, String licensee, Integer year,
            String yearlyQuarters, String details, String eqType, String equation, Double eqResult, String advEqType,
            String advEquation, Double coef, String advEqTypeResult, String advEqResult, String royaltyRates) {
        this.id = id;
        this.snippetId = snippetId;
        this.licensor = licensor;
        this.licensee = licensee;
        this.year = year;
        this.yearlyQuarters = yearlyQuarters;
        this.details = details;
        this.eqType = eqType;
        this.equation = equation;
        this.eqResult = eqResult;
        this.advEqType = advEqType;
        this.advEquation = advEquation;
        this.coef = coef;
        this.advEqTypeResult = advEqTypeResult;
        this.advEqResult = advEqResult;
        this.royaltyRates = royaltyRates;
    }




    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getSnippetId() {
        return snippetId;
    }

    public void setSnippetId(Integer snippetId) {
        this.snippetId = snippetId;
    }

    public String getLicensor() {
        return licensor;
    }

    public void setLicensor(String licensor) {
        this.licensor = licensor;
    }

    public String getLicensee() {
        return licensee;
    }

    public void setLicensee(String licensee) {
        this.licensee = licensee;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public String getYearlyQuarters() {
        return yearlyQuarters;
    }

    public void setYearlyQuarters(String yearlyQuarters) {
        this.yearlyQuarters = yearlyQuarters;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public String getEqType() {
        return eqType;
    }

    public void setEqType(String eqType) {
        this.eqType = eqType;
    }

    public String getEquation() {
        return equation;
    }

    public void setEquation(String equation) {
        this.equation = equation;
    }

    public Double getEqResult() {
        return eqResult;
    }

    public void setEqResult(Double eqResult) {
        this.eqResult = eqResult;
    }

    public String getAdvEqType() {
        return advEqType;
    }

    public void setAdvEqType(String advEqType) {
        this.advEqType = advEqType;
    }

    public String getAdvEquation() {
        return advEquation;
    }

    public void setAdvEquation(String advEquation) {
        this.advEquation = advEquation;
    }

    public Double getCoef() {
        return coef;
    }

    public void setCoef(Double coef) {
        this.coef = coef;
    }

    public String getAdvEqTypeResult() {
        return advEqTypeResult;
    }

    public void setAdvEqTypeResult(String advEqTypeResult) {
        this.advEqTypeResult = advEqTypeResult;
    }

    public String getAdvEqResult() {
        return advEqResult;
    }

    public void setAdvEqResult(String advEqResult) {
        this.advEqResult = advEqResult;
    }

    public String getRoyaltyRates() {
        return royaltyRates;
    }

    public void setRoyaltyRates(String royaltyRates) {
        this.royaltyRates = royaltyRates;
    }

}
