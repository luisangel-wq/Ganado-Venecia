"""
Cattle Weight Estimation Module v6.0 - Complete
Using Manga Bar Reference System

MANGA REFERENCE SYSTEM:
=======================

LATERAL VIEW (Side):
- Floor: y = 800 pixels
- Bar heights from floor: 18, 46, 74, 102, 130, 158 cm
- Spacing: 18cm (floor to bar 6), then 28cm between bars
- Scale: 4.02 px/cm (calibrated from 102cm bar at y=390)

BACK VIEW (Rear):
- Internal width: 60.5 cm between manga columns
- Use for measuring animal width (ANCHO)
- Note: Perspective affects measurements at different depths

MEASUREMENTS:
- ALTURA: Floor to withers (cruz) - from lateral view
- LARGO: Shoulder to pin bone - from lateral view  
- ANCHO: Widest point of barrel - from back view

Author: Claude for Luis's Venecia Ranch
Date: December 2024
"""

import math
from dataclasses import dataclass
from typing import Optional, Tuple, Dict, List
from enum import Enum


# ============================================================
# BREED AND BCS DEFINITIONS
# ============================================================

class BreedType(Enum):
    """Breed types with their height-to-perimeter ratios"""
    CEBU_PURO = ("Cebú Puro", 1.25, "Zebu puro, giba pronunciada")
    CEBU_EUROPEO = ("Cebú × Europeo", 1.30, "Cruces F1, giba moderada")
    GIROLANDO = ("Girolando", 1.35, "Gyr × Holstein, lechero tropical")
    EUROPEO_LECHERO = ("Europeo Lechero", 1.38, "Holstein, Jersey, sin giba")
    EUROPEO_CARNE = ("Europeo Carne", 1.42, "Angus, Hereford, compacto")
    
    def __init__(self, display_name: str, ratio: float, description: str):
        self.display_name = display_name
        self.ratio = ratio
        self.description = description


class BCS(Enum):
    """Body Condition Score (1-9 scale, simplified to 5 levels)"""
    VERY_THIN = (3, -0.08, "Muy Flaco", "Costillas muy visibles")
    THIN = (4, -0.04, "Delgado", "Costillas visibles")
    MODERATE = (5, 0.00, "Moderado", "Costillas palpables, no visibles")
    GOOD = (6, 0.04, "Bueno", "Costillas cubiertas")
    FAT = (7, 0.08, "Gordo", "Depósitos de grasa visibles")
    
    def __init__(self, score: int, ratio_adj: float, name: str, desc: str):
        self.score = score
        self.ratio_adjustment = ratio_adj
        self.display_name = name
        self.description = desc


# ============================================================
# MANGA REFERENCE CONSTANTS
# ============================================================

class MangaLateralRef:
    """
    Lateral view reference constants
    Calibrated from user's manga measurements
    """
    FLOOR_Y = 800  # Y-coordinate of floor in standard image
    
    # Bar heights from floor (cm)
    BAR_HEIGHTS = {
        6: 18,   # Lowest bar
        5: 46,
        4: 74,
        3: 102,  # Key reference bar
        2: 130,
        1: 158   # Highest bar
    }
    
    # Scale calibrated from 102cm bar at y=390
    # (800 - 390) / 102 = 4.02 px/cm
    DEFAULT_SCALE = 4.02
    
    @classmethod
    def get_bar_y(cls, bar_num: int, scale: float = None) -> int:
        """Get Y-coordinate for a bar number"""
        if scale is None:
            scale = cls.DEFAULT_SCALE
        height = cls.BAR_HEIGHTS.get(bar_num, 0)
        return int(cls.FLOOR_Y - height * scale)
    
    @classmethod
    def get_all_bar_positions(cls, scale: float = None) -> Dict[int, int]:
        """Get all bar Y-positions"""
        return {num: cls.get_bar_y(num, scale) for num in cls.BAR_HEIGHTS}
    
    @classmethod
    def calibrate(cls, known_bar: int, bar_y: int) -> float:
        """Calibrate scale from a known bar position"""
        height = cls.BAR_HEIGHTS[known_bar]
        return (cls.FLOOR_Y - bar_y) / height


class MangaBackRef:
    """
    Back view reference constants
    """
    INTERNAL_WIDTH_CM = 60.5  # Width between manga columns
    
    @classmethod
    def get_scale(cls, left_x: int, right_x: int) -> float:
        """Calculate scale from manga column positions"""
        width_px = abs(right_x - left_x)
        return width_px / cls.INTERNAL_WIDTH_CM


# ============================================================
# MEASUREMENT CLASSES
# ============================================================

@dataclass
class LateralMeasurement:
    """Measurements from lateral (side) view"""
    floor_y: int = 800
    cruz_y: int = 0
    shoulder_x: int = 0
    pinbone_x: int = 0
    scale: float = 4.02
    
    @property
    def altura_cm(self) -> float:
        """Height from floor to withers"""
        return (self.floor_y - self.cruz_y) / self.scale
    
    @property
    def largo_cm(self) -> float:
        """Length from shoulder to pin bone"""
        return abs(self.pinbone_x - self.shoulder_x) / self.scale


@dataclass
class BackMeasurement:
    """Measurements from back (rear) view"""
    manga_left_x: int = 0
    manga_right_x: int = 0
    animal_left_x: int = 0
    animal_right_x: int = 0
    
    @property
    def scale(self) -> float:
        """Scale from manga width reference"""
        return MangaBackRef.get_scale(self.manga_left_x, self.manga_right_x)
    
    @property
    def ancho_cm(self) -> float:
        """Animal width"""
        width_px = abs(self.animal_right_x - self.animal_left_x)
        return width_px / self.scale


# ============================================================
# WEIGHT CALCULATION
# ============================================================

def calculate_weight(
    altura_cm: float,
    largo_cm: float,
    breed: BreedType,
    bcs: BCS = BCS.MODERATE
) -> Dict:
    """
    Calculate weight using Schaeffer formula
    
    Formula: Weight = (Perímetro² × Largo) / 10840
    Where: Perímetro = Altura × Breed_Ratio × BCS_Adjustment
    """
    # Calculate adjusted ratio
    base_ratio = breed.ratio
    adjusted_ratio = base_ratio + bcs.ratio_adjustment
    
    # Calculate perímetro
    perimetro = altura_cm * adjusted_ratio
    
    # Schaeffer formula
    peso = (perimetro ** 2 * largo_cm) / 10840
    
    return {
        'altura_cm': round(altura_cm, 1),
        'largo_cm': round(largo_cm, 1),
        'perimetro_cm': round(perimetro, 1),
        'peso_kg': round(peso, 1),
        'breed': breed.display_name,
        'breed_ratio': base_ratio,
        'bcs': bcs.display_name,
        'bcs_score': bcs.score,
        'adjusted_ratio': round(adjusted_ratio, 3)
    }


def estimate_from_lateral(
    cruz_y: int,
    shoulder_x: int,
    pinbone_x: int,
    breed: BreedType,
    bcs: BCS = BCS.MODERATE,
    floor_y: int = 800,
    calibration_bar: int = 3,
    calibration_bar_y: int = 390
) -> Dict:
    """
    Estimate weight from lateral view measurements
    
    Args:
        cruz_y: Y-coordinate of withers (cruz)
        shoulder_x: X-coordinate of shoulder point
        pinbone_x: X-coordinate of pin bone
        breed: Breed type
        bcs: Body condition score
        floor_y: Y-coordinate of floor (default 800)
        calibration_bar: Bar number used for calibration (default 3 = 102cm)
        calibration_bar_y: Y-coordinate of calibration bar (default 390)
    """
    # Calibrate scale
    scale = MangaLateralRef.calibrate(calibration_bar, calibration_bar_y)
    
    # Create measurement
    measurement = LateralMeasurement(
        floor_y=floor_y,
        cruz_y=cruz_y,
        shoulder_x=shoulder_x,
        pinbone_x=pinbone_x,
        scale=scale
    )
    
    # Calculate weight
    result = calculate_weight(
        measurement.altura_cm,
        measurement.largo_cm,
        breed,
        bcs
    )
    
    # Add measurement details
    result['scale_px_per_cm'] = round(scale, 2)
    result['floor_y'] = floor_y
    result['calibration'] = f"Bar {calibration_bar} at y={calibration_bar_y}"
    
    return result


def estimate_ancho_from_back(
    manga_left_x: int,
    manga_right_x: int,
    animal_left_x: int,
    animal_right_x: int
) -> Dict:
    """
    Estimate animal width from back view
    """
    measurement = BackMeasurement(
        manga_left_x=manga_left_x,
        manga_right_x=manga_right_x,
        animal_left_x=animal_left_x,
        animal_right_x=animal_right_x
    )
    
    return {
        'manga_width_cm': MangaBackRef.INTERNAL_WIDTH_CM,
        'manga_width_px': abs(manga_right_x - manga_left_x),
        'scale_px_per_cm': round(measurement.scale, 2),
        'ancho_cm': round(measurement.ancho_cm, 1)
    }


# ============================================================
# REFERENCE TABLES
# ============================================================

def print_lateral_reference():
    """Print lateral bar reference table"""
    print("\n" + "="*60)
    print("MANGA LATERAL REFERENCE")
    print("="*60)
    print(f"{'Bar':<10} {'Height (cm)':<15} {'Y Position':<15}")
    print("-"*60)
    print(f"{'Floor':<10} {'0':<15} {MangaLateralRef.FLOOR_Y:<15}")
    
    for bar_num in sorted(MangaLateralRef.BAR_HEIGHTS.keys(), reverse=True):
        height = MangaLateralRef.BAR_HEIGHTS[bar_num]
        y_pos = MangaLateralRef.get_bar_y(bar_num)
        print(f"{'Bar ' + str(bar_num):<10} {height:<15} {y_pos:<15}")
    
    print("-"*60)
    print(f"Default Scale: {MangaLateralRef.DEFAULT_SCALE} px/cm")
    print(f"28 cm = {int(28 * MangaLateralRef.DEFAULT_SCALE)} px")
    print("="*60)


def print_breed_ratios():
    """Print breed ratio table"""
    print("\n" + "="*60)
    print("BREED RATIOS")
    print("="*60)
    print(f"{'Breed':<20} {'Ratio':<10} {'Description':<30}")
    print("-"*60)
    for breed in BreedType:
        print(f"{breed.display_name:<20} {breed.ratio:<10} {breed.description:<30}")
    print("="*60)


def print_bcs_adjustments():
    """Print BCS adjustment table"""
    print("\n" + "="*60)
    print("BCS ADJUSTMENTS")
    print("="*60)
    print(f"{'Score':<8} {'Name':<15} {'Adjustment':<12} {'Description':<25}")
    print("-"*60)
    for bcs in BCS:
        adj = f"{bcs.ratio_adjustment:+.2f}" if bcs.ratio_adjustment != 0 else "0.00"
        print(f"{bcs.score:<8} {bcs.display_name:<15} {adj:<12} {bcs.description:<25}")
    print("="*60)


# ============================================================
# MAIN - DEMO
# ============================================================

if __name__ == "__main__":
    print_lateral_reference()
    print_breed_ratios()
    print_bcs_adjustments()
    
    print("\n" + "="*60)
    print("EXAMPLE: Girolando 255 kg (known weight)")
    print("="*60)
    
    result = estimate_from_lateral(
        cruz_y=366,          # Withers position
        shoulder_x=420,      # Shoulder
        pinbone_x=935,       # Pin bone (adjusted for correct largo)
        breed=BreedType.GIROLANDO,
        bcs=BCS.MODERATE,
        floor_y=800,
        calibration_bar=3,   # Using 102cm bar
        calibration_bar_y=390
    )
    
    print(f"\nMeasurements:")
    print(f"  Altura: {result['altura_cm']} cm")
    print(f"  Largo: {result['largo_cm']} cm")
    print(f"  Perímetro: {result['perimetro_cm']} cm")
    
    print(f"\nBreed: {result['breed']} (ratio: {result['breed_ratio']})")
    print(f"BCS: {result['bcs']} (score: {result['bcs_score']})")
    print(f"Adjusted ratio: {result['adjusted_ratio']}")
    
    print(f"\n{'='*40}")
    print(f"PESO ESTIMADO: {result['peso_kg']} kg")
    print(f"PESO REAL: 255 kg")
    print(f"ERROR: {abs(result['peso_kg'] - 255) / 255 * 100:.1f}%")
    print(f"{'='*40}")
    
    print("\n" + "="*60)
    print("EXAMPLE: Back View Width")
    print("="*60)
    
    back_result = estimate_ancho_from_back(
        manga_left_x=340,
        manga_right_x=630,
        animal_left_x=380,
        animal_right_x=590
    )
    
    print(f"\nManga reference: {back_result['manga_width_cm']} cm = {back_result['manga_width_px']} px")
    print(f"Scale: {back_result['scale_px_per_cm']} px/cm")
    print(f"Animal width (ancho): {back_result['ancho_cm']} cm")
