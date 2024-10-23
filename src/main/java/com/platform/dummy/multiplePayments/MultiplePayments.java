package com.platform.dummy.multiplePayments;

import javax.persistence.*;
@Entity
@Table(name = "multiple_payments")
public class MultiplePayments {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;
        private String mapping_id;

        private String snippet_id;
        private String licensor;
        private String licensee;

        private String indiv_licensee;
        private String licensee_Affiliate;

        private Integer multiplier;
        private String qualifiers;
        private String license_sales;
        private Integer year;
        private String yearly_quarters;
        private String period_start;
        private String period_end;

        private String information_type;
        private Float payment_amount;
        private String payment_amount_in_local_currency;
        private String local_currency;

        private String percentage_value;

        private String payment_type;
        private String details;
        private String directory_path;
        private String eq_type;
        private String equation;
        private String eq_result;   
        private String adv_eq_type;
        private String adv_equation;
        private String coef;
        private String adv_eq_result;
        private String nested_eq;
        private String nested_eq_result;
        private String royalty_rates;
        private Double results;
    
        private String modified;

        private String comment;

        public MultiplePayments() {
        }

        public MultiplePayments(Long id, String mapping_id, String snippet_id, String licensor, String licensee,
                        String indiv_licensee, String licensee_Affiliate, Integer multiplier, String qualifiers,
                        String license_sales, Integer year, String yearly_quarters, String period_start,
                        String period_end, String information_type, Float payment_amount,
                        String payment_amount_in_local_currency, String local_currency, String percentage_value,
                        String payment_type, String details, String directory_path, String eq_type, String equation,
                        String eq_result, String adv_eq_type, String adv_equation, String coef, String adv_eq_result,
                        String nested_eq, String nested_eq_result, String royalty_rates, Double results,
                        String modified, String comment) {
                this.id = id;
                this.mapping_id = mapping_id;
                this.snippet_id = snippet_id;
                this.licensor = licensor;
                this.licensee = licensee;
                this.indiv_licensee = indiv_licensee;
                this.licensee_Affiliate = licensee_Affiliate;
                this.multiplier = multiplier;
                this.qualifiers = qualifiers;
                this.license_sales = license_sales;
                this.year = year;
                this.yearly_quarters = yearly_quarters;
                this.period_start = period_start;
                this.period_end = period_end;
                this.information_type = information_type;
                this.payment_amount = payment_amount;
                this.payment_amount_in_local_currency = payment_amount_in_local_currency;
                this.local_currency = local_currency;
                this.percentage_value = percentage_value;
                this.payment_type = payment_type;
                this.details = details;
                this.directory_path = directory_path;
                this.eq_type = eq_type;
                this.equation = equation;
                this.eq_result = eq_result;
                this.adv_eq_type = adv_eq_type;
                this.adv_equation = adv_equation;
                this.coef = coef;
                this.adv_eq_result = adv_eq_result;
                this.nested_eq = nested_eq;
                this.nested_eq_result = nested_eq_result;
                this.royalty_rates = royalty_rates;
                this.results = results;
                this.modified = modified;
                this.comment = comment;
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

        public String getSnippet_id() {
                return snippet_id;
        }

        public void setSnippet_id(String snippet_id) {
                this.snippet_id = snippet_id;
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

        public String getIndiv_licensee() {
                return indiv_licensee;
        }

        public void setIndiv_licensee(String indiv_licensee) {
                this.indiv_licensee = indiv_licensee;
        }

        public String getLicensee_Affiliate() {
                return licensee_Affiliate;
        }

        public void setLicensee_Affiliate(String licensee_Affiliate) {
                this.licensee_Affiliate = licensee_Affiliate;
        }

        public Integer getMultiplier() {
                return multiplier;
        }

        public void setMultiplier(Integer multiplier) {
                this.multiplier = multiplier;
        }

        public String getQualifiers() {
                return qualifiers;
        }

        public void setQualifiers(String qualifiers) {
                this.qualifiers = qualifiers;
        }

        public String getLicense_sales() {
                return license_sales;
        }

        public void setLicense_sales(String license_sales) {
                this.license_sales = license_sales;
        }

        public Integer getYear() {
                return year;
        }

        public void setYear(Integer year) {
                this.year = year;
        }

        public String getYearly_quarters() {
                return yearly_quarters;
        }

        public void setYearly_quarters(String yearly_quarters) {
                this.yearly_quarters = yearly_quarters;
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

        public Float getPayment_amount() {
                return payment_amount;
        }

        public void setPayment_amount(Float payment_amount) {
                this.payment_amount = payment_amount;
        }

        public String getPayment_amount_in_local_currency() {
                return payment_amount_in_local_currency;
        }

        public void setPayment_amount_in_local_currency(String payment_amount_in_local_currency) {
                this.payment_amount_in_local_currency = payment_amount_in_local_currency;
        }

        public String getLocal_currency() {
                return local_currency;
        }

        public void setLocal_currency(String local_currency) {
                this.local_currency = local_currency;
        }

        public String getPercentage_value() {
                return percentage_value;
        }

        public void setPercentage_value(String percentage_value) {
                this.percentage_value = percentage_value;
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

        public String getEq_type() {
                return eq_type;
        }

        public void setEq_type(String eq_type) {
                this.eq_type = eq_type;
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

        public String getAdv_eq_type() {
                return adv_eq_type;
        }

        public void setAdv_eq_type(String adv_eq_type) {
                this.adv_eq_type = adv_eq_type;
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

        public Double getResults() {
                return results;
        }

        public void setResults(Double results) {
                this.results = results;
        }

        public String getModified() {
                return modified;
        }

        public void setModified(String modified) {
                this.modified = modified;
        }

        public String getComment() {
                return comment;
        }

        public void setComment(String comment) {
                this.comment = comment;
        }

        
}
