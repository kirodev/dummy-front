package com.platform.dummy.multiplePayments;

import jakarta.persistence.*;
@Entity
@Table(name = "multiple_payments")
public class MultiplePayments {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long ID;
        private String snippet_id;
        private String licensor;
        private String licensee;
        private String licensee_Affiliate;

        private Integer multiplier;
        private String qualifiers;
        private String License_sales;
        private Integer Year;
        private String Yearly_quarters;
        private String Information_type;
        private Float Payment_amount;
        private String Payment_amount_in_local_currency;
        private String Local_currency;

        private String Percentage_value;

        private String Payment_type;
        private String details;
        private String directory_path;

        private String modified;

        private String comment;

        public MultiplePayments() {
        }

        public MultiplePayments(Long ID, String snippet_id, String licensor, String licensee, String licensee_Affiliate, Integer multiplier, String qualifiers, String license_sales, Integer year, String yearly_quarters, String information_type, Float payment_amount, String payment_amount_in_local_currency, String local_currency, String percentage_value, String payment_type, String details, String directory_path, String modified, String comment) {
                this.ID = ID;
                this.snippet_id = snippet_id;
                this.licensor = licensor;
                this.licensee = licensee;
                this.licensee_Affiliate = licensee_Affiliate;
                this.multiplier = multiplier;
                this.qualifiers = qualifiers;
                License_sales = license_sales;
                Year = year;
                Yearly_quarters = yearly_quarters;
                Information_type = information_type;
                Payment_amount = payment_amount;
                Payment_amount_in_local_currency = payment_amount_in_local_currency;
                Local_currency = local_currency;
                Percentage_value = percentage_value;
                Payment_type = payment_type;
                this.details = details;
                this.directory_path = directory_path;
                this.modified = modified;
                this.comment = comment;
        }

        public Long getID() {
                return ID;
        }

        public void setID(Long ID) {
                this.ID = ID;
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
                return License_sales;
        }

        public void setLicense_sales(String license_sales) {
                License_sales = license_sales;
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
