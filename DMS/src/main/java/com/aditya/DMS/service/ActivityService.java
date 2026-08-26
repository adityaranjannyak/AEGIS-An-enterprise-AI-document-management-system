package com.aditya.DMS.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.aditya.DMS.entity.Activity;
import com.aditya.DMS.entity.Document;
import com.aditya.DMS.entity.User;
import com.aditya.DMS.repository.ActivityRepo;

@Service
public class ActivityService {

    private final ActivityRepo activityRepo;

    public ActivityService(ActivityRepo activityRepo) {
        this.activityRepo = activityRepo;
    }

    public Activity log(
            User user,
            Document document,
            String action,
            String details) {

        Activity activity = new Activity();

        activity.setUser(user);
        activity.setDocument(document);
        activity.setAction(action);
        activity.setDetails(details);
        activity.setTimestamp(LocalDateTime.now());

        return activityRepo.save(activity);
    }

    public List<Activity> getAllActivities() {
        return activityRepo.findAllByOrderByTimestampDesc();
    }

    public List<Activity> getActivitiesByUser(User user) {
        return activityRepo.findByUserOrderByTimestampDesc(user);
    }

    public List<Activity> getActivitiesByDocument(Document document) {
        return activityRepo.findByDocumentOrderByTimestampDesc(document);
    }
}