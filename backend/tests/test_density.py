from __future__ import annotations

import numpy as np
import pytest

from services.density_detector import DensityDetector


class _Value:
    def __init__(self, value: float):
        self._value = value

    def item(self):
        return self._value


class _Box:
    def __init__(self, cls_id: int, confidence: float):
        self.cls = _Value(cls_id)
        self.conf = _Value(confidence)


class _Result:
    def __init__(self, boxes):
        self.boxes = boxes


class _MockModel:
    def __init__(self, results):
        self._results = results

    def predict(self, image, verbose=False):
        return self._results


@pytest.fixture()
def detector() -> DensityDetector:
    # Bypass __init__ to avoid loading real YOLO model.
    detector = DensityDetector.__new__(DensityDetector)
    detector.confidence_threshold = 0.5
    return detector


def test_calculate_rho_zero_people(detector: DensityDetector):
    rho = detector.calculate_rho(person_count=0, area_m2=100.0)
    assert rho == 0.0


def test_calculate_rho_caps_to_one(detector: DensityDetector):
    rho = detector.calculate_rho(person_count=1000, area_m2=50.0)
    assert rho == 1.0


def test_calculate_rho_negative_people_raises(detector: DensityDetector):
    with pytest.raises(ValueError):
        detector.calculate_rho(person_count=-1, area_m2=100.0)


def test_calculate_rho_zero_area_raises(detector: DensityDetector):
    with pytest.raises(ValueError):
        detector.calculate_rho(person_count=10, area_m2=0)


def test_analyze_frame_filters_confidence_and_class(detector: DensityDetector):
    DensityDetector._model = _MockModel(
        [
            _Result(
                [
                    _Box(cls_id=0, confidence=0.51),  # count
                    _Box(cls_id=0, confidence=0.50),  # filtered out (strict > 0.5)
                    _Box(cls_id=2, confidence=0.99),  # not person
                    _Box(cls_id=0, confidence=0.88),  # count
                ]
            )
        ]
    )
    image = np.zeros((720, 1280, 3), dtype=np.uint8)
    result = detector.analyze_frame(image=image, area_m2=10.0)
    assert result["count"] == 2
    assert result["rho"] == pytest.approx(0.05, abs=1e-6)
    assert result["inference_time_ms"] >= 0


def test_analyze_frame_empty_image_raises(detector: DensityDetector):
    with pytest.raises(ValueError):
        detector.analyze_frame(np.array([]), area_m2=10.0)
