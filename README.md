# CeCoSUNK
Celestial Collision Simulator Utilizing Newtonian Kinematics (CeCoSunk) is a browser based simulator for the movement of celestial bodies.

## Dependencies
CeCoSUNK uses
- NPM for managing packages and scripts
- live-server for the dev server
- Bootstrap icons for various icons
- Chart.js to plot v-t and x-t graphs

## Data
CeCoSUNK uses SI units for all measurements unless specifically stated. 

## Black Holes

Black holes are currently in beta. To create one, click **New Black Hole (beta)**
in the side panel, fill in the required fields, and click **Submit**.

### Creating a Black Hole

- **Mass (solar masses)** is required and must be greater than zero.
- **X pos (AU)** and **Y pos (AU)** specify the black hole's position.
  Both fields are optional and default to `0` when left blank.
- The **Event horizon** readout updates as the mass is changed, allowing you
  to see the calculated horizon radius before creating the black hole.

The event horizon is calculated using the Schwarzschild radius:

![image](https://www.perthobservatory.com.au/wp-content/uploads/schwarzschild-radius-mathematical-equation-600x422.jpg)

The calculated radius is displayed in AU, km, or m depending on its size.

### Black Hole Behaviour

A newly created black hole starts at rest and interacts gravitationally with
the other bodies in the simulation.

When a body crosses the black hole's event horizon, it is absorbed. The black
hole's mass, velocity, position, and horizon radius are then updated based on
the combined bodies. If two black holes are captured by each other, the
heavier black hole absorbs the lighter one.

### Visualization

Black holes are displayed as a black circle with an orange ring representing
the event horizon. For very small black holes, the displayed circle is kept
at a minimum size so that it remains visible on the canvas.

## Contributing
Please see [CONTRIBUTING.md](/CONTRIBUTING.md) for details about contributing to CeCoSUNK

