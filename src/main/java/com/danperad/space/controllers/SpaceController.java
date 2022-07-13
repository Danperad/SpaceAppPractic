package com.danperad.space.controllers;

import com.danperad.space.models.AnswerModel;
import com.danperad.space.models.RequestModel;
import com.danperad.space.models.AnswerApiModel;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;


import java.time.Instant;
import java.time.format.DateTimeParseException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

@RestController("api")
public class SpaceController {

    @CrossOrigin
    @PostMapping("main")
    AnswerModel getSpaceImage(@RequestBody RequestModel model) {
        if (model.getDate().length != 2) return new AnswerModel(false, null, "date");
        try {
            Instant t1 = Instant.parse(model.getDate()[0]);
            Instant t2 = Instant.parse(model.getDate()[1]);
            if (t1.isAfter(t2)) return new AnswerModel(false, null, "date");
        } catch (DateTimeParseException e) {
            return new AnswerModel(false, null, "date");
        }
        if (model.getAngle().length != 2 || model.getAngle()[0] > model.getAngle()[1] || model.getAngle()[0] > 90
                || model.getAngle()[0] < 0 || model.getAngle()[1] > 90 || model.getAngle()[1] < 0)
            return new AnswerModel(false, null, "angle");
        if (model.getCloud().length != 2 || model.getCloud()[0] > model.getCloud()[1] || model.getCloud()[0] > 100
                || model.getCloud()[0] < 0 || model.getCloud()[1] > 100 || model.getCloud()[1] < 0)
            return new AnswerModel(false, null, "cloud");
        if (model.getSensors().length == 0) return new AnswerModel(false, null, "sensors");
        Map<String, String> m = new HashMap<>();
        m.put("acquisition_date_after", model.getDate()[0]);
        m.put("acquisition_date_before", model.getDate()[1]);
        m.put("cloudiness_max", String.valueOf(model.getCloud()[1]));
        m.put("geometry", model.getGeometry().toString());
        if (Arrays.asList(model.getSensors()).contains("PSS") && model.getSensors().length != 1){
            m.put("platform_type_identifier", "RP,KV");
        } else if (Arrays.asList(model.getSensors()).contains("PSS")) {
            m.put("platform_type_identifier", "KV");
        } else {
            m.put("platform_type_identifier", "RP");
        }
        m.put("instrument_identifiers", model.getSensorsString());
        RestTemplate s = new RestTemplate();
        AnswerApiModel answer;
        try {
            String API_URL = "https://api.gptl.ru/catalog/v2/search?platform_type_identifier={platform_type_identifier}&instrument_identifiers={instrument_identifiers}&acquisition_date_after={acquisition_date_after}&acquisition_date_before={acquisition_date_before}&cloudiness_max={cloudiness_max}&geometry={geometry}&coverage_exists=true";
            answer = s.getForObject(API_URL, AnswerApiModel.class, m);
        } catch (Exception e){
            e.printStackTrace();
            return new AnswerModel(false, null, "get");
        }
        return new AnswerModel(true, answer, null);
    }
}
