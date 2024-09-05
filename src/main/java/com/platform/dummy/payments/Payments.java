package com.platform.dummy.payments;

import javax.persistence.*;

@Entity
@Table(name = "payments")
public class Payments {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String mapping_id;
    private Long snippet_id;
    private Long pair_id;

    private String licensor;
    private String licensee;
    private String licensee_Affiliate;
    private String license_sales;
    private String indication;

    private String year;  // Changed to String as per table definition
    
    private String quarter;  // Ensure it’s mapped to yearly_quarters in DB
    private String period_start;
    private String period_end;
    private String information_type;
    
    @Column(name = "payment_amount")
    private Integer paymentAmount;  // Adjust to match DB field

    private Integer payment_amount_in_local_currency;
    private String local_currency;

    @Column(name = "royalty_rate_dollar")
    private Double royaltyRateDollar;  // Changed to Double

    @Column(name = "royalty_rate_per")
    private Double royaltyRatePer;  // Changed to Double
    private Double royalty_min_dollar;
    private Double royalty_min_per;
    private Double royalty_max_dollar;
    private Double royalty_max_per;
    private Integer percentage_value;
    private String percentage_indication;

    private String payment_type;
    private String details;
    private String directory_path;
    private String document_name;
    private String document_date;
    private String comment;

    private String modified;

    @Column(name = "eq_type")
    private String eqType;

    private String equation;
    private String eq_result;
    
    @Column(name = "adv_eq_type")
    private String advEqType;

    private String adv_equation;
    private String coef;
    private String adv_eq_type_result;
    private String adv_eq_result;
    private String nested_eq;
    private String nested_eq_result;
    private String royalty_rates;

    // Getters and setters for all fields...

    public Payments() {
    }

    public Payments(Long id, String mapping_id, Long snippet_id, Long pair_id, String licensor, String licensee,
            String licensee_Affiliate, String license_sales, String indication, String year, String quarter,
            String period_start, String period_end, String information_type, Integer paymentAmount,
            Integer payment_amount_in_local_currency, String local_currency, Double royaltyRateDollar,
            Double royaltyRatePer, Double royalty_min_dollar, Double royalty_min_per, Double royalty_max_dollar,
            Double royalty_max_per, Integer percentage_value, String percentage_indication, String payment_type,
            String details, String directory_path, String document_name, String document_date, String comment,
            String modified, String eqType, String equation, String eq_result, String advEqType, String adv_equation,
            String coef, String adv_eq_type_result, String adv_eq_result, String nested_eq, String nested_eq_result,
            String royalty_rates) {
        this.id = id;
        this.mapping_id = mapping_id;
        this.snippet_id = snippet_id;
        this.pair_id = pair_id;
        this.licensor = licensor;
        this.licensee = licensee;
        this.licensee_Affiliate = licensee_Affiliate;
        this.license_sales = license_sales;
        this.indication = indication;
        this.year = year;
        this.quarter = quarter;
        this.period_start = period_start;
        this.period_end = period_end;
        this.information_type = information_type;
        this.paymentAmount = paymentAmount;
        this.payment_amount_in_local_currency = payment_amount_in_local_currency;
        this.local_currency = local_currency;
        this.royaltyRateDollar = royaltyRateDollar;
        this.royaltyRatePer = royaltyRatePer;
        this.royalty_min_dollar = royalty_min_dollar;
        this.royalty_min_per = royalty_min_per;
        this.royalty_max_dollar = royalty_max_dollar;
        this.royalty_max_per = royalty_max_per;
        this.percentage_value = percentage_value;
        this.percentage_indication = percentage_indication;
        this.payment_type = payment_type;
        this.details = details;
        this.directory_path = directory_path;
        this.document_name = document_name;
        this.document_date = document_date;
        this.comment = comment;
        this.modified = modified;
        this.eqType = eqType;
        this.equation = equation;
        this.eq_result = eq_result;
        this.advEqType = advEqType;
        this.adv_equation = adv_equation;
        this.coef = coef;
        this.adv_eq_type_result = adv_eq_type_result;
        this.adv_eq_result = adv_eq_result;
        this.nested_eq = nested_eq;
        this.nested_eq_result = nested_eq_result;
        this.royalty_rates = royalty_rates;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMapping_id() {
        return mapping_id;
    }

    public void setMapping_id(String mapping_id) {
        this.mapping_id = mapping_id;
    }

    public Long getSnippet_id() {
        return snippet_id;
    }

    public void setSnippet_id(Long snippet_id) {
        this.snippet_id = snippet_id;
    }

    public Long getPair_id() {
        return pair_id;
    }

    public void setPair_id(Long pair_id) {
        this.pair_id = pair_id;
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

    public String getLicensee_Affiliate() {
        return licensee_Affiliate;
    }

    public void setLicensee_Affiliate(String licensee_Affiliate) {
        this.licensee_Affiliate = licensee_Affiliate;
    }

    public String getLicense_sales() {
        return license_sales;
    }

    public void setLicense_sales(String license_sales) {
        this.license_sales = license_sales;
    }

    public String getIndication() {
        return indication;
    }

    public void setIndication(String indication) {
        this.indication = indication;
    }

    public String getYear() {
        return year;
    }

    public void setYear(String year) {
        this.year = year;
    }

    public String getQuarter() {
        return quarter;
    }

    public void setQuarter(String quarter) {
        this.quarter = quarter;
    }

    public String getPeriod_start() {
        return period_start;
    }

    public void setPeriod_start(String period_start) {
        this.period_start = period_start;
    }

    public String getPeriod_end() {
        return period_end;
    }

    public void setPeriod_end(String period_end) {
        this.period_end = period_end;
    }

    public String getInformation_type() {
        return information_type;
    }

    public void setInformation_type(String information_type) {
        this.information_type = information_type;
    }

    public Integer getPaymentAmount() {
        return paymentAmount;
    }

    public void setPaymentAmount(Integer paymentAmount) {
        this.paymentAmount = paymentAmount;
    }

    public Integer getPayment_amount_in_local_currency() {
        return payment_amount_in_local_currency;
    }

    public void setPayment_amount_in_local_currency(Integer payment_amount_in_local_currency) {
        this.payment_amount_in_local_currency = payment_amount_in_local_currency;
    }

    public String getLocal_currency() {
        return local_currency;
    }

    public void setLocal_currency(String local_currency) {
        this.local_currency = local_currency;
    }

    public Double getRoyaltyRateDollar() {
        return royaltyRateDollar;
    }

    public void setRoyaltyRateDollar(Double royaltyRateDollar) {
        this.royaltyRateDollar = royaltyRateDollar;
    }

    public Double getRoyaltyRatePer() {
        return royaltyRatePer;
    }

    public void setRoyaltyRatePer(Double royaltyRatePer) {
        this.royaltyRatePer = royaltyRatePer;
    }

    public Double getRoyalty_min_dollar() {
        return royalty_min_dollar;
    }

    public void setRoyalty_min_dollar(Double royalty_min_dollar) {
        this.royalty_min_dollar = royalty_min_dollar;
    }

    public Double getRoyalty_min_per() {
        return royalty_min_per;
    }

    public void setRoyalty_min_per(Double royalty_min_per) {
        this.royalty_min_per = royalty_min_per;
    }

    public Double getRoyalty_max_dollar() {
        return royalty_max_dollar;
    }

    public void setRoyalty_max_dollar(Double royalty_max_dollar) {
        this.royalty_max_dollar = royalty_max_dollar;
    }

    public Double getRoyalty_max_per() {
        return royalty_max_per;
    }

    public void setRoyalty_max_per(Double royalty_max_per) {
        this.royalty_max_per = royalty_max_per;
    }

    public Integer getPercentage_value() {
        return percentage_value;
    }

    public void setPercentage_value(Integer percentage_value) {
        this.percentage_value = percentage_value;
    }

    public String getPercentage_indication() {
        return percentage_indication;
    }

    public void setPercentage_indication(String percentage_indication) {
        this.percentage_indication = percentage_indication;
    }

    public String getPayment_type() {
        return payment_type;
    }

    public void setPayment_type(String payment_type) {
        this.payment_type = payment_type;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public String getDirectory_path() {
        return directory_path;
    }

    public void setDirectory_path(String directory_path) {
        this.directory_path = directory_path;
    }

    public String getDocument_name() {
        return document_name;
    }

    public void setDocument_name(String document_name) {
        this.document_name = document_name;
    }

    public String getDocument_date() {
        return document_date;
    }

    public void setDocument_date(String document_date) {
        this.document_date = document_date;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public String getModified() {
        return modified;
    }

    public void setModified(String modified) {
        this.modified = modified;
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

    public String getEq_result() {
        return eq_result;
    }

    public void setEq_result(String eq_result) {
        this.eq_result = eq_result;
    }

    public String getAdvEqType() {
        return advEqType;
    }

    public void setAdvEqType(String advEqType) {
        this.advEqType = advEqType;
    }

    public String getAdv_equation() {
        return adv_equation;
    }

    public void setAdv_equation(String adv_equation) {
        this.adv_equation = adv_equation;
    }

    public String getCoef() {
        return coef;
    }

    public void setCoef(String coef) {
        this.coef = coef;
    }

    public String getAdv_eq_type_result() {
        return adv_eq_type_result;
    }

    public void setAdv_eq_type_result(String adv_eq_type_result) {
        this.adv_eq_type_result = adv_eq_type_result;
    }

    public String getAdv_eq_result() {
        return adv_eq_result;
    }

    public void setAdv_eq_result(String adv_eq_result) {
        this.adv_eq_result = adv_eq_result;
    }

    public String getNested_eq() {
        return nested_eq;
    }

    public void setNested_eq(String nested_eq) {
        this.nested_eq = nested_eq;
    }

    public String getNested_eq_result() {
        return nested_eq_result;
    }

    public void setNested_eq_result(String nested_eq_result) {
        this.nested_eq_result = nested_eq_result;
    }

    public String getRoyalty_rates() {
        return royalty_rates;
    }

    public void setRoyalty_rates(String royalty_rates) {
        this.royalty_rates = royalty_rates;
    }

}