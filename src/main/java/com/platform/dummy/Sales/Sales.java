package com.platform.dummy.Sales;



import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "sales")

public class Sales {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String company;
    private String sources;
    private String link;
    private Integer years;
    private String quarters;
    private Double total;
    private Double sales;
    private Double others;
    private String discarded;
    private String used;
    private String total_sources;
    private String total_discarded;
    private String source;
    private Double source_sales;



    public Sales() {
    }



    public Sales(Long id, String company, String sources, String link, Integer years, String quarters, Double total,
            Double sales, Double others, String discarded, String used, String total_sources, String total_discarded,
            String source, Double source_sales) {
        this.id = id;
        this.company = company;
        this.sources = sources;
        this.link = link;
        this.years = years;
        this.quarters = quarters;
        this.total = total;
        this.sales = sales;
        this.others = others;
        this.discarded = discarded;
        this.used = used;
        this.total_sources = total_sources;
        this.total_discarded = total_discarded;
        this.source = source;
        this.source_sales = source_sales;
    }



    public Long getId() {
        return id;
    }



    public void setId(Long id) {
        this.id = id;
    }



    public String getCompany() {
        return company;
    }



    public void setCompany(String company) {
        this.company = company;
    }



    public String getSources() {
        return sources;
    }



    public void setSources(String sources) {
        this.sources = sources;
    }



    public String getLink() {
        return link;
    }



    public void setLink(String link) {
        this.link = link;
    }



    public Integer getYears() {
        return years;
    }



    public void setYears(Integer years) {
        this.years = years;
    }



    public String getQuarters() {
        return quarters;
    }



    public void setQuarters(String quarters) {
        this.quarters = quarters;
    }



    public Double getTotal() {
        return total;
    }



    public void setTotal(Double total) {
        this.total = total;
    }



    public Double getSales() {
        return sales;
    }



    public void setSales(Double sales) {
        this.sales = sales;
    }



    public Double getOthers() {
        return others;
    }



    public void setOthers(Double others) {
        this.others = others;
    }



    public String getDiscarded() {
        return discarded;
    }



    public void setDiscarded(String discarded) {
        this.discarded = discarded;
    }



    public String getUsed() {
        return used;
    }



    public void setUsed(String used) {
        this.used = used;
    }



    public String getTotal_sources() {
        return total_sources;
    }



    public void setTotal_sources(String total_sources) {
        this.total_sources = total_sources;
    }



    public String getTotal_discarded() {
        return total_discarded;
    }



    public void setTotal_discarded(String total_discarded) {
        this.total_discarded = total_discarded;
    }



    public String getSource() {
        return source;
    }



    public void setSource(String source) {
        this.source = source;
    }



    public Double getSource_sales() {
        return source_sales;
    }



    public void setSource_sales(Double source_sales) {
        this.source_sales = source_sales;
    }





    
}
