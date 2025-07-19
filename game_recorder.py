import os
import tkinter as tk
from tkinter import ttk
import random
from PIL import Image, ImageTk  # Import PIL for handling images
import sys

def resource_path(relative_path):
    """ Get absolute path to resource, works for dev and for PyInstaller """
    try:
        # PyInstaller creates a temp folder and stores path in _MEIPASS
        base_path = sys._MEIPASS
    except Exception:
        base_path = os.path.abspath(".")

    return os.path.join(base_path, relative_path)
    
class PlayerSetup:
    def __init__(self, root):
        self.root = root
        self.root.title("Player Setup")
        self.players = []
        self.player_colors = {}
        self.root.geometry("1000x800")  # Set a fixed window size
        self.style = ttk.Style()
        self.style.theme_use("clam")
        self.session_counter = 0  # Initialize session counter

        # Create a notebook
        self.notebook = ttk.Notebook(self.root)
        self.notebook.pack(fill=tk.BOTH, expand=True)

        # Create tabs
        self.create_tabs()

    def set_tab_background(self, frame, image_path):
        # Load the image
        background_image = Image.open(resource_path("background.jpg"))
        # Resize image to cover the full tab - adjust these dimensions as needed
        background_image = background_image.resize((1000, 800), Image.Resampling.LANCZOS) 
        background_photo = ImageTk.PhotoImage(background_image)

        # Create a label and place the image
        background_label = tk.Label(frame, image=background_photo)
        background_label.image = background_photo  # Keep a reference
        background_label.place(relwidth=1, relheight=1)  # Cover the full area of the frame

    def create_tabs(self):
        # Home tab
        self.home_frame = ttk.Frame(self.notebook)
        self.notebook.add(self.home_frame, text="Home")
        self.set_tab_background(self.home_frame, "background.jpg")  # Set background for home tab
        
        # ... Add widgets to home_frame ...
        
        self.session_listbox = tk.Listbox(self.home_frame, font=("Helvetica", 14))
        self.session_listbox.pack(fill=tk.BOTH, expand=True)

        # Start New Session button in Home tab
        self.start_session_button = ttk.Button(self.home_frame, text="Start New Session", command=self.show_add_player_tab, style="TButton")
        self.start_session_button.pack(side=tk.TOP)

        # View Button
        self.view_button = ttk.Button(self.home_frame, text="View Session", command=self.view_session_summary, style="TButton")
        self.view_button.pack()

        # Exit button moved to Home tab
        self.exit_button = ttk.Button(self.home_frame, text="Exit", command=self.root.quit, style="TButton")
        self.exit_button.pack(side=tk.BOTTOM)

        # Load existing sessions
        for file in os.listdir():
            if file.startswith("session_") and file.endswith("_summary.txt"):
                self.session_listbox.insert(tk.END, file)
        
        # Add Player tab
        self.add_player_frame = ttk.Frame(self.notebook)
        self.set_tab_background(self.add_player_frame, "background.jpg")  # Set background for add player tab
        
        #self.notebook.add(self.add_player_frame, text="Add Player")

        self.player_label = ttk.Label(self.add_player_frame, text="Enter player names:", font=("Helvetica", 14))
        self.player_label.pack()

        self.player_name_entry = ttk.Entry(self.add_player_frame, font=("Helvetica", 14))
        self.player_name_entry.pack()

        self.add_player_button = ttk.Button(self.add_player_frame, text="Add Player", command=self.add_player, style="TButton")
        self.add_player_button.pack()

        self.done_button = ttk.Button(self.add_player_frame, text="Done", command=self.init_roll_order_form, style="TButton")
        self.done_button.pack()

        self.player_listbox = tk.Listbox(self.add_player_frame, font=("Helvetica", 14))
        self.player_listbox.pack()

        # Remove Player button
        self.remove_player_button = ttk.Button(self.add_player_frame, text="Remove Player", command=self.remove_player, style="TButton")
        self.remove_player_button.pack()

        # Exit button (Keep only this one)
        self.exit_button = ttk.Button(self.add_player_frame, text="Exit", command=self.close_add_player_tab, style="TButton")
        self.exit_button.pack()
        
        # Session and Session Summary tabs (initially hidden)
        self.session_tabs = {}
        self.session_summary_tabs = {}
    
    def show_add_player_tab(self):
        # Dynamically create and add the Add Player tab if it doesn't exist
        if 'add_player_frame' not in self.__dict__:
            self.add_player_frame = ttk.Frame(self.notebook)
            self.notebook.add(self.add_player_frame, text="Add Player")
            self.set_tab_background(self.add_player_frame, "background.jpg")  # Set background for add player tab
            
            # Add widgets to add_player_frame
            self.player_label = ttk.Label(self.add_player_frame, text="Enter player names:", font=("Helvetica", 14))
            self.player_label.pack()

            self.player_name_entry = ttk.Entry(self.add_player_frame, font=("Helvetica", 14))
            self.player_name_entry.pack()

            self.add_player_button = ttk.Button(self.add_player_frame, text="Add Player", command=self.add_player, style="TButton")
            self.add_player_button.pack()

            self.done_button = ttk.Button(self.add_player_frame, text="Done", command=self.init_roll_order_form, style="TButton")
            self.done_button.pack()

            self.player_listbox = tk.Listbox(self.add_player_frame, font=("Helvetica", 14))
            self.player_listbox.pack()

            self.remove_player_button = ttk.Button(self.add_player_frame, text="Remove Player", command=self.remove_player, style="TButton")
            self.remove_player_button.pack()

            self.exit_button = ttk.Button(self.add_player_frame, text="Exit", command=self.close_add_player_tab, style="TButton")
            self.exit_button.pack()

        # Select the Add Player tab
        self.notebook.select(self.add_player_frame)
    
    def close_add_player_tab(self):
        self.notebook.forget(self.add_player_frame)
    
    def show_add_player_tab(self):
        if self.add_player_frame not in self.notebook.tabs():
            self.notebook.add(self.add_player_frame, text="Add Player")
        self.notebook.select(self.add_player_frame)
    
    def view_session_summary(self):
        selected_indices = self.session_listbox.curselection()
        if selected_indices:
            selected_index = selected_indices[0]
            session_file = self.session_listbox.get(selected_index)

            # Create a new tab for the session summary
            summary_tab = ttk.Frame(self.notebook)
            self.notebook.add(summary_tab, text=f"Summary of {session_file}")
            self.set_tab_background(summary_tab, "background.jpg")  # Set background for summary tab

            # Add a Text widget to display the session summary
            summary_text = tk.Text(summary_tab, wrap=tk.WORD, font=("Helvetica", 14))
            summary_text.pack(fill=tk.BOTH, expand=True)

            # Read and insert the session summary into the Text widget
            with open(session_file, "r") as file:
                summary_content = file.read()
                summary_text.insert(tk.END, summary_content)

            # Close Button
            close_button = ttk.Button(summary_tab, text="Close", command=lambda: self.close_summary_tab(summary_tab), style="TButton")
            close_button.pack()

            # Switch to the new tab
            self.notebook.select(summary_tab)
    
    def close_summary_tab(self, tab):
        self.notebook.forget(tab)
    
    def remove_player(self):
            selected_indices = self.player_listbox.curselection()
            if selected_indices:
                selected_index = selected_indices[0]
                player_name = self.player_listbox.get(selected_index)
                self.player_listbox.delete(selected_index)
                self.players.remove(player_name)
                if player_name in self.player_colors:
                    del self.player_colors[player_name]
                
    def add_player(self):
        player_name = self.player_name_entry.get()
        if player_name:
            self.players.append(player_name)
            self.player_colors[player_name] = '#ff0000'
            self.player_name_entry.delete(0, tk.END)
            self.player_listbox.insert(tk.END, player_name)

    def generate_random_color(self):
        return "#{:02x}{:02x}{:02x}".format(random.randint(0, 255), random.randint(0, 255), random.randint(0, 255))

    def switch_to_turn_entries(self):
        if self.players:
            self.session_counter += 1  # Increment session counter
            self.init_turn_entries_form()  # Initialize the Turn Entries form
            self.notebook.select(self.session_tabs[self.session_counter])
            current_player_name = self.players[0]
            player_color = self.player_colors.get(current_player_name, "blue")
            self.player_name_label.config(text=f"Player: {current_player_name}", foreground=player_color)
            self.player_name_label.update_idletasks()  # Update the label to ensure proper sizing
            self.submit_button["state"] = tk.NORMAL
            self.next_turn_button["state"] = tk.DISABLED

    def init_turn_entries_form(self):
        # Create a new session tab
        self.session_tabs[self.session_counter] = ttk.Frame(self.notebook)
        self.notebook.add(self.session_tabs[self.session_counter], text=f"Session {self.session_counter}")
        self.set_tab_background(self.session_tabs[self.session_counter], "background.jpg")  # Set background for session tab

        # Configuring grid row/column weights for centering
        self.session_tabs[self.session_counter].grid_columnconfigure(0, weight=1)
        self.session_tabs[self.session_counter].grid_columnconfigure(2, weight=1)

        # Transparent color for text boxes
        transparent_color = '#f0f0f0'  # Light gray color

        # Player name label
        if 'player_name_label' not in self.__dict__:
            self.player_name_label = ttk.Label(self.session_tabs[self.session_counter], font=("Helvetica", 18, "bold"))
            self.player_name_label.grid(row=0, column=1, pady=10)

        if self.players:
            current_player_name = self.players[0]
            player_color = self.player_colors.get(current_player_name, "blue")
            self.player_name_label.config(text=f"Player: {current_player_name}", foreground=player_color)

        # Situation label and text box
        self.situation_label = ttk.Label(self.session_tabs[self.session_counter], text="Situation:", font=("Helvetica", 16))
        self.situation_label.grid(row=1, column=0, sticky="e", padx=20)
        self.situation_text = tk.Text(self.session_tabs[self.session_counter], width=40, height=4, font=("Helvetica", 14), bg=transparent_color)
        self.situation_text.grid(row=1, column=1, padx=20)

        # Roll label and text box
        self.roll_label = ttk.Label(self.session_tabs[self.session_counter], text="Roll:", font=("Helvetica", 16))
        self.roll_label.grid(row=2, column=0, sticky="e", padx=20)
        self.roll_text = tk.Text(self.session_tabs[self.session_counter], width=40, height=4, font=("Helvetica", 14), bg=transparent_color)
        self.roll_text.grid(row=2, column=1, padx=20)

        # Other labels and text boxes
        labels = ["Move:", "Action:", "Bonus Action:", "Reaction:"]
        self.input_entries = []
        for i, label in enumerate(labels):
            ttk.Label(self.session_tabs[self.session_counter], text=label, font=("Helvetica", 16)).grid(row=i + 3, column=0, sticky="e", padx=20)
            entry = tk.Text(self.session_tabs[self.session_counter], width=40, height=4, font=("Helvetica", 14), bg=transparent_color)
            entry.grid(row=i + 3, column=1, padx=20)
            self.input_entries.append(entry)

        # Create a frame for buttons
        button_frame = ttk.Frame(self.session_tabs[self.session_counter])
        button_frame.grid(row=7, column=0, columnspan=3)

        # Place buttons inside this frame
        self.submit_button = ttk.Button(button_frame, text="Submit", command=self.submit_turn, style="TButton")
        self.submit_button.grid(row=0, column=0, padx=10, pady=10)
        self.submit_button["state"] = tk.NORMAL

        self.next_turn_button = ttk.Button(button_frame, text="Next Turn", command=self.next_turn, style="TButton")
        self.next_turn_button.grid(row=0, column=1, padx=10, pady=10)
        self.next_turn_button["state"] = tk.DISABLED

        self.save_button = ttk.Button(button_frame, text="Save Session", command=self.save_session_summary, style="TButton")
        self.save_button.grid(row=0, column=2, padx=10, pady=10)

        self.exit_button = ttk.Button(button_frame, text="Exit Session", command=self.exit_session, style="TButton")
        self.exit_button.grid(row=0, column=3, padx=10, pady=10)

        # Create a session summary tab (initially hidden)
        self.session_summary_tabs[self.session_counter] = ttk.Frame(self.notebook)
        self.notebook.add(self.session_summary_tabs[self.session_counter], text=f"Session Summary {self.session_counter}")
        self.set_tab_background(self.session_summary_tabs[self.session_counter], "background.jpg")  # Set background for session summary tab
        
        
        
    def save_session_summary(self):
        if hasattr(self, 'session_summary_text'):
            summary_content = self.session_summary_text.get("1.0", tk.END)
            filename = f"session_{self.session_counter}_summary.txt"
            with open(filename, "w") as file:
                file.write(summary_content)
            print("Session summary saved!")  # For confirmation
            self.session_listbox.insert(tk.END, filename)  # Update the session list in the home tab
        
    def submit_turn(self):
        # Get the situation text
        situation = self.situation_text.get("1.0", "end-1c")
        
        # Get the roll text
        roll = self.roll_text.get("1.0", "end-1c")

        # Get the other actions
        move = self.input_entries[0].get("1.0", "end-1c")
        action = self.input_entries[1].get("1.0", "end-1c")
        bonus_action = self.input_entries[2].get("1.0", "end-1c")
        reaction = self.input_entries[3].get("1.0", "end-1c")

        # Check if the session summary text box has been created
        if not hasattr(self, 'session_summary_text'):
            self.session_summary_text = tk.Text(self.session_summary_tabs[self.session_counter], wrap=tk.WORD, font=("Helvetica", 14))
        self.session_summary_text.pack(fill=tk.BOTH, expand=True)

        # Append the situation, roll, and recorded turn to the Text widget in the Session Summary tab
        session_summary_text = self.session_summary_text
        session_summary_text.insert(tk.END, f"Player: {self.players[0]}\n")
        session_summary_text.insert(tk.END, f"Situation: {situation}\n")
        session_summary_text.insert(tk.END, f"Roll: {roll}\n")
        session_summary_text.insert(tk.END, f"Move: {move}\n")
        session_summary_text.insert(tk.END, f"Action: {action}\n")
        session_summary_text.insert(tk.END, f"Bonus Action: {bonus_action}\n")
        session_summary_text.insert(tk.END, f"Reaction: {reaction}\n")
        session_summary_text.insert(tk.END, "-" * 40 + "\n")

        # Append the situation, roll, and recorded turn to a file
        with open(f"session_{self.session_counter}_turn_history.txt", "a") as file:
            file.write(f"Player: {self.players[0]}\n")
            file.write(f"Situation: {situation}\n")
            file.write(f"Roll: {roll}\n")
            file.write(f"Move: {move}\n")
            file.write(f"Action: {action}\n")
            file.write(f"Bonus Action: {bonus_action}\n")
            file.write(f"Reaction: {reaction}\n")
            file.write("-" * 40 + "\n")

        # Clear all input entries, including situation and roll
        self.situation_text.delete("1.0", "end")
        self.roll_text.delete("1.0", "end")
        for entry in self.input_entries:
            entry.delete("1.0", "end")

        # Update button states
        self.submit_button["state"] = tk.DISABLED
        self.next_turn_button["state"] = tk.NORMAL        
        self.player_name_label.config(foreground="gray")
            
    def next_turn(self):
        self.players.append(self.players.pop(0))  # Move the current player to the end of the list
        current_player_name = self.players[0]
        player_color = self.player_colors.get(current_player_name, "blue")
        self.player_name_label.config(text=f"Player: {current_player_name}", foreground=player_color)
        self.submit_button["state"] = tk.NORMAL
        self.next_turn_button["state"] = tk.DISABLED

    def exit_session(self):
        if self.session_counter in self.session_tabs:
            self.notebook.forget(self.session_tabs[self.session_counter])
            del self.session_tabs[self.session_counter]
        
        if self.session_counter in self.session_summary_tabs:
            self.notebook.forget(self.session_summary_tabs[self.session_counter])
            del self.session_summary_tabs[self.session_counter]

        # Optionally, reset the session counter or handle it as needed
        # self.session_counter = 0
    
    def init_roll_order_form(self):
        self.roll_order_frame = ttk.Frame(self.notebook)
        self.notebook.add(self.roll_order_frame, text="Roll for Turn Order")

        # Create a frame to hold the contents and center them
        content_frame = ttk.Frame(self.roll_order_frame)
        content_frame.pack(pady=20)

        self.roll_entries = {}
        for i, player in enumerate(self.players):
            ttk.Label(content_frame, text=f"{player} roll:", font=("Helvetica", 14)).grid(row=i, column=0, padx=10, pady=5)
            roll_entry = ttk.Entry(content_frame, font=("Helvetica", 14))
            roll_entry.grid(row=i, column=1, padx=10, pady=5)
            self.roll_entries[player] = roll_entry

        # Button at the bottom, centered
        button_frame = ttk.Frame(self.roll_order_frame)
        button_frame.pack(pady=10)
        self.roll_button = ttk.Button(button_frame, text="Determine Order", command=self.determine_order, style="TButton")
        self.roll_button.pack()

        self.notebook.select(self.roll_order_frame)

    def determine_order(self):
        rolls = {}
        for player, entry in self.roll_entries.items():
            try:
                roll = int(entry.get())
                rolls[player] = roll
            except ValueError:
                print(f"Invalid roll for {player}, setting to 0")
                rolls[player] = 0

        sorted_players = sorted(rolls, key=rolls.get, reverse=True)
        self.players = sorted_players

        # Set the session counter to one more than the highest existing session number
        self.session_counter = self.get_highest_session_number() + 1

        # Remove the roll order frame
        self.notebook.forget(self.roll_order_frame)

        # Initialize the session form and select the session tab
        self.init_turn_entries_form()
        self.notebook.select(self.session_tabs[self.session_counter])
        
    def get_highest_session_number(self):
        highest_number = 0
        for i in range(self.session_listbox.size()):
            session_file = self.session_listbox.get(i)
            try:
                # Extract the session number from the filename
                number = int(session_file.split('_')[1])
                highest_number = max(highest_number, number)
            except (IndexError, ValueError):
                # Handle cases where the filename doesn't match the expected format
                continue
        return highest_number
    
if __name__ == "__main__":
    root = tk.Tk()
    app = PlayerSetup(root)
    root.mainloop()