import 'package:chat_app/widgets/buttons/fab/expandable_comp.dart';
import 'package:chat_app/utils/theme/app_theme.dart';
import 'package:flutter/material.dart';

/// Expandable floating action button that fans [children] out in a 90° arc.
///
/// Tap the menu icon to expand; tap the close icon to collapse. Each child
/// is an [ExpandingActionButton] animated with [distance] as the max radius.
// TODO: close automatically on navigation or child button press
class ActionButton extends StatefulWidget {
  const ActionButton(
      {super.key,
      this.initialOpen,
      required this.distance,
      required this.children});

  /// Whether the FAB starts in the expanded state. Defaults to false.
  final bool? initialOpen;

  /// Maximum distance (in logical pixels) each child travels from the origin.
  final double distance;

  /// Action buttons revealed when the FAB expands.
  final List<Widget> children;

  @override
  State<ActionButton> createState() => _ActionButtonState();
}

class _ActionButtonState extends State<ActionButton>
    with SingleTickerProviderStateMixin {
  late final AnimationController animationController;
  late final Animation<double> expandAnimation;
  bool open = false;

  @override
  void initState() {
    super.initState();
    open = widget.initialOpen ?? false;
    animationController = AnimationController(
        vsync: this,
        value: open ? 1.0 : 0.0,
        duration: const Duration(milliseconds: 250));
    expandAnimation = CurvedAnimation(
        parent: animationController,
        curve: Curves.linearToEaseOut,
        reverseCurve: Curves.easeInToLinear);
  }

  @override
  void dispose() {
    animationController.dispose();
    super.dispose();
  }

  void toggle() {
    setState(() {
      open = !open;
      if (open) {
        animationController.forward();
      } else {
        animationController.reverse();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox.expand(
      child: Padding(
        padding: const EdgeInsets.all(6.0),
        child: Stack(
          alignment: Alignment.bottomRight,
          clipBehavior: Clip.none,
          children: [
            tapToClose(),
            ...expandingActionButtons(),
            tapToOpen(),
          ],
        ),
      ),
    );
  }

  Widget tapToClose() {
    return SizedBox(
      width: 56.0,
      height: 56.0,
      child: Center(
        child: Material(
          color: Colors.white,
          shape: const CircleBorder(),
          clipBehavior: Clip.antiAlias,
          elevation: 4.0,
          child: InkWell(
            onTap: toggle,
            child: const Padding(
              padding: EdgeInsets.all(8.0),
              child: Icon(
                Icons.close,
                size: 28,
                color: Colors.black,
              ),
            ),
          ),
        ),
      ),
    );
  }

  List<Widget> expandingActionButtons() {
    final children = <Widget>[];
    final count = widget.children.length;
    final step = 90 / (count - 1);
    for (var i = 0, angleInDegrees = 0.0;
        i < count;
        i++, angleInDegrees += step) {
      children.add(ExpandingActionButton(
          directionInDegrees: angleInDegrees,
          maxDistance: widget.distance,
          progress: expandAnimation,
          child: widget.children[i]));
    }
    return children;
  }

  Widget tapToOpen() {
    return SizedBox(
      width: 64.0,
      height: 64.0,
      child: IgnorePointer(
        ignoring: open,
        child: AnimatedContainer(
          width: 58.0,
          height: 58.0,
          transformAlignment: Alignment.bottomRight,
          transform:
              Matrix4.diagonal3Values(open ? 0.7 : 1.0, open ? 0.7 : 1.0, 1.0),
          duration: const Duration(milliseconds: 250),
          curve: const Interval(0.0, 0.5, curve: Curves.easeOut),
          child: AnimatedOpacity(
            opacity: open ? 0.0 : 1.0,
            curve: const Interval(0.25, 1.0, curve: Curves.easeInOut),
            duration: const Duration(milliseconds: 250),
            child: FloatingActionButton(
              onPressed: toggle,
              backgroundColor: AppTheme.appTheme.primaryColor,
              child: const Icon(
                Icons.menu,
                size: 32,
                color: Colors.white,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
