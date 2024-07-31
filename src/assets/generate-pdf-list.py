import os
import json

def get_pdf_files(directory):
    pdf_files = []
    assets_directory = os.path.abspath(directory)
    
    for root, _, files in os.walk(assets_directory):
        for file in files:
            if file.endswith('.pdf'):
                file_path = os.path.join(root, file)
                relative_path = os.path.relpath(file_path, assets_directory).replace('\\', '/')
                pdf_files.append({'path': relative_path, 'name': relative_path})
    
    return pdf_files

def generate_json_file(file_list, output_file):
    with open(output_file, 'w') as f:
        json.dump(file_list, f, indent=2)

if __name__ == "__main__":
    directory_path = r'C:\Users\Karim\frontend\dummy-front\src\assets'  # Replace with your directory path
    output_json_file = r'C:\Users\Karim\frontend\dummy-front\src\assets\pdf-files.json'  # Replace with your desired output JSON file path

    pdf_files_list = get_pdf_files(directory_path)
    generate_json_file(pdf_files_list, output_json_file)
    print(f"JSON file created successfully at {output_json_file}")
