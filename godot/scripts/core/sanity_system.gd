extends Node
class_name SanitySystem

# Simple, autoload-friendly sanity model for "vibe horror" scenes.
#
# Usage:
# 1. Add this script to godot/scripts/core/sanity_system.gd
# 2. In Project Settings -> AutoLoad, add:
#       Path: res://scripts/core/sanity_system.gd
#       Name: Sanity
# 3. Call from any script:
#       Sanity.apply_sanity_delta(-5.0)
#       var s := Sanity.get_sanity()
#       if Sanity.is_breaking():
#           Sanity.trigger_break_event()

@export var max_sanity: float = 100.0
@export var min_sanity: float = 0.0
@export var start_sanity: float = 80.0

@export var break_threshold: float = 20.0
@export var recovery_rate_per_second: float = 2.0
@export var passive_drain_per_second: float = 0.0

var _current_sanity: float
var _is_breaking: bool = false

signal sanity_changed(value: float)
signal sanity_break_started
signal sanity_break_ended

func _ready() -> void:
    _current_sanity = clampf(start_sanity, min_sanity, max_sanity)
    _emit_changed()

func _process(delta: float) -> void:
    var delta_sanity := 0.0

    if passive_drain_per_second != 0.0:
        delta_sanity -= passive_drain_per_second * delta

    if not _is_breaking and recovery_rate_per_second > 0.0:
        delta_sanity += recovery_rate_per_second * delta

    if delta_sanity != 0.0:
        _set_sanity_internal(_current_sanity + delta_sanity)

func apply_sanity_delta(delta_value: float) -> void:
    _set_sanity_internal(_current_sanity + delta_value)

func set_sanity(value: float) -> void:
    _set_sanity_internal(value)

func get_sanity() -> float:
    return _current_sanity

func get_sanity_normalized() -> float:
    if max_sanity <= min_sanity:
        return 0.0
    return (_current_sanity - min_sanity) / (max_sanity - min_sanity)

func is_breaking() -> bool:
    return _is_breaking

func trigger_break_event() -> void:
    if _is_breaking:
        return
    _is_breaking = true
    emit_signal("sanity_break_started")

func end_break_event() -> void:
    if not _is_breaking:
        return
    _is_breaking = false
    emit_signal("sanity_break_ended")

func _set_sanity_internal(value: float) -> void:
    var clamped := clampf(value, min_sanity, max_sanity)
    if is_equal_approx(clamped, _current_sanity):
        return

    _current_sanity = clamped
    _emit_changed()

    if _current_sanity <= break_threshold and not _is_breaking:
        trigger_break_event()
    elif _current_sanity > break_threshold and _is_breaking:
        end_break_event()

func _emit_changed() -> void:
    emit_signal("sanity_changed", _current_sanity)
