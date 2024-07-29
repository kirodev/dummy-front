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
    private Long totalRevenue;

    @Column(name = "licensing_revenue")
    private Long licensingRevenue;

    @Column(name = "recurring_revenue")
    private Long recurringRevenue;

    @Column(name = "fixed_fee")
    private Long fixedFee;

    @Column(name = "per_unit")
    private Long perUnit;

    @Column(name = "past_sales")
    private Long pastSales;


    public AnnualRevenues() {

    }
    public AnnualRevenues(Integer id, String licensor, Integer year, Long totalRevenue, Long licensingRevenue, Long recurringRevenue, Long fixedFee, Long perUnit, Long pastSales) {
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

    public Long getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(Long totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public Long getLicensingRevenue() {
        return licensingRevenue;
    }

    public void setLicensingRevenue(Long licensingRevenue) {
        this.licensingRevenue = licensingRevenue;
    }

    public Long getRecurringRevenue() {
        return recurringRevenue;
    }

    public void setRecurringRevenue(Long recurringRevenue) {
        this.recurringRevenue = recurringRevenue;
    }

    public Long getFixedFee() {
        return fixedFee;
    }

    public void setFixedFee(Long fixedFee) {
        this.fixedFee = fixedFee;
    }

    public Long getPerUnit() {
        return perUnit;
    }

    public void setPerUnit(Long perUnit) {
        this.perUnit = perUnit;
    }

    public Long getPastSales() {
        return pastSales;
    }

    public void setPastSales(Long pastSales) {
        this.pastSales = pastSales;
    }

}
