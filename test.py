import matplotlib.pyplot as plt
import numpy as np

# Generating some sample data
x = np.linspace(0, 10, 100)  # 100 points between 0 and 10
y1 = np.sin(x)  # Sine wave
y2 = np.cos(x)  # Cosine wave

# Creating the plot
plt.figure(figsize=(10, 6))  # Set figure size

# Plotting the sine wave
plt.plot(x, y1, label='Sine Wave', linestyle='-', color='blue')

# Plotting the cosine wave
plt.plot(x, y2, label='Cosine Wave', linestyle='--', color='red')

# Adding labels, title, and legend
plt.title('Sine and Cosine Waves', fontsize=16)
plt.xlabel('X Values', fontsize=12)
plt.ylabel('Y Values', fontsize=12)
plt.legend(fontsize=12)

# Adding a grid
plt.grid(True, linestyle='--', alpha=0.7)

# Display the plot
plt.show()
