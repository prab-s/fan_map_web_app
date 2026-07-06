from types import SimpleNamespace
import unittest

from backend.main import product_matches_parameter_filters


def make_parameter(group_name: str, parameter_name: str, value_number=None, value_string=None):
    return SimpleNamespace(
        group_name=group_name,
        parameter_name=parameter_name,
        value_number=value_number,
        value_string=value_string,
    )


def make_rpm_line(rpm: float, airflow_pressure_pairs: list[tuple[float, float]]):
    points = [
        SimpleNamespace(airflow=airflow, pressure=pressure)
        for airflow, pressure in airflow_pressure_pairs
    ]
    return SimpleNamespace(rpm=rpm, points=points)


class GraphFilterRangeTests(unittest.TestCase):
    def test_graph_rpm_filter_rejects_products_with_any_rpm_above_max(self):
        product = SimpleNamespace(
            id=1,
            model="Test Fan",
            parameter_groups=[],
            rpm_lines=[
                make_rpm_line(1800, [(10.0, 100.0)]),
                make_rpm_line(2400, [(12.0, 120.0)]),
            ],
            efficiency_points=[],
        )
        filters = [
            {
                "group_name": "__graph__",
                "parameter_name": "rpm",
                "min_number": None,
                "max_number": 2300,
                "value_string": None,
            }
        ]

        self.assertFalse(product_matches_parameter_filters(product, filters))

    def test_graph_rpm_filter_allows_products_with_all_rpms_within_window(self):
        product = SimpleNamespace(
            id=2,
            model="Control Fan",
            parameter_groups=[],
            rpm_lines=[
                make_rpm_line(1800, [(10.0, 100.0)]),
                make_rpm_line(2200, [(12.0, 120.0)]),
            ],
            efficiency_points=[],
        )
        filters = [
            {
                "group_name": "__graph__",
                "parameter_name": "rpm",
                "min_number": None,
                "max_number": 2300,
                "value_string": None,
            }
        ]

        self.assertTrue(product_matches_parameter_filters(product, filters))


if __name__ == "__main__":
    unittest.main()
