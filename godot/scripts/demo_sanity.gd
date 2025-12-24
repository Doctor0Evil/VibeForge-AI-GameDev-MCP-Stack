# DemoSanity scene controller (extracted from the embedded .tscn resource)
# Attached to `res://scenes/demo_sanity.tscn` as `script = ExtResource(1)`
# TODO: If you prefer a different structure, move logic to a dedicated UI/HUD controller.

extends Control

@onready var label := $Label
@onready var panic_btn := $PanicButton
@onready var calm_btn := $CalmButton

func _ready() -> void:
    # Wire to the global Sanity autoload (see README, add AutoLoad with name `Sanity`)
    if Engine.has_singleton("Sanity"):
        var sanity = Engine.get_singleton("Sanity")
        sanity.sanity_changed.connect(_on_sanity_changed)
        sanity.sanity_break_started.connect(_on_break_started)
        sanity.sanity_break_ended.connect(_on_break_ended)
        _on_sanity_changed(sanity.get_sanity())

    panic_btn.pressed.connect(_on_panic_pressed)
    calm_btn.pressed.connect(_on_calm_pressed)

func _on_panic_pressed() -> void:
    if Engine.has_singleton("Sanity"):
        Engine.get_singleton("Sanity").apply_sanity_delta(-15.0)

func _on_calm_pressed() -> void:
    if Engine.has_singleton("Sanity"):
        Engine.get_singleton("Sanity").apply_sanity_delta(10.0)

func _on_sanity_changed(value: float) -> void:
    label.text = "Sanity: %0.1f" % value

func _on_break_started() -> void:
    label.text += "\nBREAKING"
    label.add_theme_color_override("font_color", Color(1, 0.4, 0.4))

func _on_break_ended() -> void:
    label.add_theme_color_override("font_color", Color(1, 1, 1))
