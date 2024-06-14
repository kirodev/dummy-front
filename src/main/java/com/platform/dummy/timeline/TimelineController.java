package com.platform.dummy.timeline;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/timeline")
public class TimelineController {

    @Autowired
    private TimelineRepository timelineRepository;

    @GetMapping
    public List<Timeline> getAllTimelines() {
        return timelineRepository.findAll();
    }
}
