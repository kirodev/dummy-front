package com.platform.dummy.AnnualRevenues;

import javax.persistence.*;

@Entity
@Table(name = "annual_revenues")
public class AnnualRevenues {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "licensor")
    private String licensor;
    
    @Column(name = "year")
    private Integer year;

    @Column(name = "total_revenue")
    private Integer totalRevenue;

    @Column(name = "licensing_revenue")
    private Integer licensingRevenue;

    @Column(name = "recurring_revenue")
    private Integer recurringRevenue;

    @Column(name = "fixed_fee")
    private Integer fixedFee;

    @Column(name = "per_unit")
    private Integer perUnit;

    @Column(name = "past_sales")
    private Integer pastSales;


    public AnnualRevenues() {

    }
    public AnnualRevenues(Integer id, String licensor, Integer year, Integer totalRevenue, Integer licensingRevenue, Integer recurringRevenue, Integer fixedFee, Integer perUnit, Integer pastSales) {
        this.id = id;
        this.licensor = licensor;
        this.year = year;
        this.totalRevenue = totalRevenue;
        this.licensingRevenue = licensingRevenue;
        this.recurringRevenue = recurringRevenue;
        this.fixedFee = fixedFee;
        this.perUnit = perUnit;
        this.pastSales = pastSales;
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

    public Integer getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(Integer totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public Integer getLicensingRevenue() {
        return licensingRevenue;
    }

    public void setLicensingRevenue(Integer licensingRevenue) {
        this.licensingRevenue = licensingRevenue;
    }

    public Integer getRecurringRevenue() {
        return recurringRevenue;
    }

    public void setRecurringRevenue(Integer recurringRevenue) {
        this.recurringRevenue = recurringRevenue;
    }

    public Integer getFixedFee() {
        return fixedFee;
    }

    public void setFixedFee(Integer fixedFee) {
        this.fixedFee = fixedFee;
    }

    public Integer getPerUnit() {
        return perUnit;
    }

    public void setPerUnit(Integer perUnit) {
        this.perUnit = perUnit;
    }

    public Integer getPastSales() {
        return pastSales;
    }

    public void setPastSales(Integer pastSales) {
        this.pastSales = pastSales;
    }

}
