package com.platform.dummy.Sales;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sales")
public class SalesController {

    private final SalesRepository salesRepository;

    @Autowired
    public SalesController(SalesRepository salesRepository) {
        this.salesRepository = salesRepository;
    }

    // GET all sales
    @GetMapping
    public List<Sales> getAllSales() {
        return salesRepository.findAll();
    }

    // GET sale by ID
    @GetMapping("/{id}")
    public Sales getSaleById(@PathVariable Long id) {
        return salesRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sale not found with id " + id));
    }

    // POST new sale
    @PostMapping
    public Sales addSale(@RequestBody Sales sales) {
        return salesRepository.save(sales);
    }

    // PUT update existing sale
    @PutMapping("/{id}")
    public Sales updateSale(@PathVariable Long id, @RequestBody Sales salesDetails) {
        Sales sales = salesRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sale not found with id " + id));
        sales.setCompany(salesDetails.getCompany());
        sales.setSources(salesDetails.getSources());
        sales.setLink(salesDetails.getLink());
        sales.setYears(salesDetails.getYears());
        sales.setQuarters(salesDetails.getQuarters());
        sales.setTotal(salesDetails.getTotal());
        sales.setSales(salesDetails.getSales());
        sales.setOthers(salesDetails.getOthers());
        sales.setDiscarded(salesDetails.getDiscarded());
        sales.setUsed(salesDetails.getUsed());
        sales.setTotal_discarded(salesDetails.getTotal_discarded());
        sales.setTotal_sources(salesDetails.getTotal_sources());

        return salesRepository.save(sales);
    }

    // DELETE sale
    @DeleteMapping("/{id}")
    public void deleteSale(@PathVariable Long id) {
        salesRepository.deleteById(id);
    }
}
