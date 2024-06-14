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
    private Integer year;
    private String yearly_quarters;
    private String period_start;
    private String period_end;
    private String information_type;
    private Float payment_amount;
    private String payment_amount_in_local_currency;
    private String local_currency;
    private String royalty_rate_dollar;
    private String royalty_rate_per;

    private String royalty_min_dollar;

    private String royalty_min_per;
    private String royalty_max_dollar;
    private String royalty_max_per;
    private String percentage_value;

    private String percentage_indication;

    private String payment_type;
    private String details;
    private String directory_path;
    private String document_name;

    private String document_date;
    private String comment;
    private String modified;



    public Payments() {
    }

    public Payments(Long id, String mapping_id, Long snippet_id, Long pair_id, String licensor, String licensee, String licensee_Affiliate, String license_sales, String indication, Integer year, String yearly_quarters, String period_start, String period_end, String information_type, Float payment_amount, String payment_amount_in_local_currency, String local_currency, String royalty_rate_dollar, String royalty_rate_per, String royalty_min_dollar, String royalty_min_per, String royalty_max_dollar, String royalty_max_per, String percentage_value, String percentage_indication, String payment_type, String details, String directory_path, String document_name, String document_date, String comment, String modified) {
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
        this.yearly_quarters = yearly_quarters;
        this.period_start = period_start;
        this.period_end = period_end;
        this.information_type = information_type;
        this.payment_amount = payment_amount;
        this.payment_amount_in_local_currency = payment_amount_in_local_currency;
        this.local_currency = local_currency;
        this.royalty_rate_dollar = royalty_rate_dollar;
        this.royalty_rate_per = royalty_rate_per;
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

    public String getRoyalty_rate_dollar() {
        return royalty_rate_dollar;
    }

    public void setRoyalty_rate_dollar(String royalty_rate_dollar) {
        this.royalty_rate_dollar = royalty_rate_dollar;
    }

    public String getRoyalty_rate_per() {
        return royalty_rate_per;
    }

    public void setRoyalty_rate_per(String royalty_rate_per) {
        this.royalty_rate_per = royalty_rate_per;
    }

    public String getRoyalty_min_dollar() {
        return royalty_min_dollar;
    }

    public void setRoyalty_min_dollar(String royalty_min_dollar) {
        this.royalty_min_dollar = royalty_min_dollar;
    }

    public String getRoyalty_min_per() {
        return royalty_min_per;
    }

    public void setRoyalty_min_per(String royalty_min_per) {
        this.royalty_min_per = royalty_min_per;
    }

    public String getRoyalty_max_dollar() {
        return royalty_max_dollar;
    }

    public void setRoyalty_max_dollar(String royalty_max_dollar) {
        this.royalty_max_dollar = royalty_max_dollar;
    }

    public String getRoyalty_max_per() {
        return royalty_max_per;
    }

    public void setRoyalty_max_per(String royalty_max_per) {
        this.royalty_max_per = royalty_max_per;
    }

    public String getPercentage_value() {
        return percentage_value;
    }

    public void setPercentage_value(String percentage_value) {
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
}