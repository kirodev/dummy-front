package com.platform.dummy.AnnualRevenues;

import javax.persistence.*;

@Entity
@Table(name = "annual_revenues")
public class AnnualRevenues {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String licensor;
    private Integer year;
    private Long total_revenue;
    private Long licensing_revenue;
    private Long recurring_revenue;
    private Long fixed_fee;

    private Long per_unit;

    private Long past_sales;


    public AnnualRevenues() {

    }


    public AnnualRevenues(Integer id, String licensor, Integer year, Long total_revenue, Long licensing_revenue,
            Long recurring_revenue, Long fixed_fee, Long per_unit, Long past_sales) {
        this.id = id;
        this.licensor = licensor;
        this.year = year;
        this.total_revenue = total_revenue;
        this.licensing_revenue = licensing_revenue;
        this.recurring_revenue = recurring_revenue;
        this.fixed_fee = fixed_fee;
        this.per_unit = per_unit;
        this.past_sales = past_sales;
    }


    public Integer getId() {
        return id;
    }


    public void setId(Integer id) {
        this.id = id;
    }


    public String getLicensor() {
        return licensor;
    }


    public void setLicensor(String licensor) {
        this.licensor = licensor;
    }


    public Integer getYear() {
        return year;
    }


    public void setYear(Integer year) {
        this.year = year;
    }


    public Long getTotal_revenue() {
        return total_revenue;
    }


    public void setTotal_revenue(Long total_revenue) {
        this.total_revenue = total_revenue;
    }


    public Long getLicensing_revenue() {
        return licensing_revenue;
    }


    public void setLicensing_revenue(Long licensing_revenue) {
        this.licensing_revenue = licensing_revenue;
    }


    public Long getRecurring_revenue() {
        return recurring_revenue;
    }


    public void setRecurring_revenue(Long recurring_revenue) {
        this.recurring_revenue = recurring_revenue;
    }


    public Long getFixed_fee() {
        return fixed_fee;
    }


    public void setFixed_fee(Long fixed_fee) {
        this.fixed_fee = fixed_fee;
    }


    public Long getPer_unit() {
        return per_unit;
    }


    public void setPer_unit(Long per_unit) {
        this.per_unit = per_unit;
    }


    public Long getPast_sales() {
        return past_sales;
    }


    public void setPast_sales(Long past_sales) {
        this.past_sales = past_sales;
    }

}
