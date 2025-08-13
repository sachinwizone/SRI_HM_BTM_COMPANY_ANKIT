using System;
using System.Windows.Forms;

namespace TallySync
{
    internal static class Program
    {
        /// <summary>
        /// The main entry point for the application.
        /// </summary>
        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            
            // Use the configurable main form for local Windows deployment
            Application.Run(new ConfigurableMainForm());
        }
    }
}