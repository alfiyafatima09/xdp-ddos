# xdp-ddos

In order to run this, ensure 
1. your data set is stored ni csv format in the xdp-ddos/data folder , if not too (the trained model joblist is already present so no issues)
2. All paths in this code is from my system, so change the path to your relative path before executing
3. install all necessary dependencies from pip as follows
pip install pandas numpy scikit-learn matplotlib seaborn
4. run train_model.py directly from gui or python -u "path of train_model.py" (like python -u "c:\Users\megal\Desktop\projec\xdp\xdp-ddos\userspace\tempCodeRunnerFile.py")
5. run test_model.py the same way [only for verification, optional]
6. run stats_reader.py as usual after opening and listening on port, for this step, follow usual xdp instructions
7. [testting on vm ware env is still pending]
temp bhav implementation of ddos xdp capstone work
<img width="1087" height="533" alt="image" src="https://github.com/user-attachments/assets/375b476e-50bc-468d-96f9-384203dc1395" />
