package com.platform.dummy;

import jakarta.persistence.*;

@Entity
@Table(name = "Payments")
public class Payments {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long ID;
    private String licensor;
    private String Licensee;
    private String licensee_Affiliate;
    private String License_sales;
    private String Indication;
    private Integer Year;
    private String Yearly_quarters;
    private String Information_type;
    private Float Payment_amount;
    private String Payment_amount_in_local_currency;
    private String Local_currency;
    private String Percentage_value;
    private String Payment_type;
    private String statement;
    private String directory_path;
    private String document_date;

    public Payments(){}


    public Payments(Long ID, String licensor, String licensee, String licensee_Affiliate, String license_sales, String indication, Integer year, String yearly_quarters, String information_type, Float payment_amount, String payment_amount_in_local_currency, String local_currency, String percentage_value, String payment_type, String statement, String directory_path, String document_date) {
        this.ID = ID;
        this.licensor = licensor;
        Licensee = licensee;
        this.licensee_Affiliate = licensee_Affiliate;
        License_sales = license_sales;
        Indication = indication;
        Year = year;
        Yearly_quarters = yearly_quarters;
        Information_type = information_type;
        Payment_amount = payment_amount;
        Payment_amount_in_local_currency = payment_amount_in_local_currency;
        Local_currency = local_currency;
        Percentage_value = percentage_value;
        Payment_type = payment_type;
        this.statement = statement;
        this.directory_path = directory_path;
        this.document_date = document_date;
    }

    public Long getID() {
        return ID;
    }

    public void setID(Long ID) {
        this.ID = ID;
    }

    public String getLicensor() {
        return licensor;
    }

    public void setLicensor(String licensor) {
        this.licensor = licensor;
    }

    public String getLicensee() {
        return Licensee;
    }

    public void setLicensee(String licensee) {
        Licensee = licensee;
    }

    public String getLicensee_Affiliate() {
        return licensee_Affiliate;
    }

    public void setLicensee_Affiliate(String licensee_Affiliate) {
        this.licensee_Affiliate = licensee_Affiliate;
    }

    public String getLicense_sales() {
        return License_sales;
    }

    public void setLicense_sales(String license_sales) {
        License_sales = license_sales;
    }

    public String getIndication() {
        return Indication;
    }

    public void setIndication(String indication) {
        Indication = indication;
    }

    public Integer getYear() {
        return Year;
    }

    public void setYear(Integer year) {
        Year = year;
    }

    public String getYearly_quarters() {
        return Yearly_quarters;
    }

    public void setYearly_quarters(String yearly_quarters) {
        Yearly_quarters = yearly_quarters;
    }

    public String getInformation_type() {
        return Information_type;
    }

    public void setInformation_type(String information_type) {
        Information_type = information_type;
    }

    public Float getPayment_amount() {
        return Payment_amount;
    }

    public void setPayment_amount(Float payment_amount) {
        Payment_amount = payment_amount;
    }

    public String getPayment_amount_in_local_currency() {
        return Payment_amount_in_local_currency;
    }

    public void setPayment_amount_in_local_currency(String payment_amount_in_local_currency) {
        Payment_amount_in_local_currency = payment_amount_in_local_currency;
    }

    public String getLocal_currency() {
        return Local_currency;
    }

    public void setLocal_currency(String local_currency) {
        Local_currency = local_currency;
    }

    public String getPercentage_value() {
        return Percentage_value;
    }

    public void setPercentage_value(String percentage_value) {
        Percentage_value = percentage_value;
    }

    public String getPayment_type() {
        return Payment_type;
    }

    public void setPayment_type(String payment_type) {
        Payment_type = payment_type;
    }

    public String getStatement() {
        return statement;
    }

    public void setStatement(String statement) {
        this.statement = statement;
    }

    public String getDirectory_path() {
        return directory_path;
    }

    public void setDirectory_path(String directory_path) {
        this.directory_path = directory_path;
    }

    public String getDocument_date() {
        return document_date;
    }

    public void setDocument_date(String document_date) {
        this.document_date = document_date;
    }
}
