#include<stdio.h>
#include<stdlib.h>
#include<sys/time.h>
#include<wiringPi.h>

struct timeval sharedTimeval;
double current() {
	gettimeofday(&sharedTimeval, NULL);
	return sharedTimeval.tv_sec * 1e6 + sharedTimeval.tv_usec;
}

int main(int argc, char **argv) {
	
	// wiring pi setup
	if (wiringPiSetupGpio() < 0) {
		fprintf(stderr, "Failed to setup wiring pi\n");
		return 1;
	}
	
	// obtain read pin number
	int pin = 20;
	if (argc > 1) {
		pin = atoi(argv[1]);
	}
	fprintf(stderr, "GPIO Pin Number : %d\n", pin);
	
	// obtain wait interval (us)
	double wait = 4e4;
	if (argc > 2) {
		wait = atoi(argv[2]);
	}
	
	// set gpio pin mode
	pinMode(pin, INPUT);
	
	double buffer[1024];
	double currentTime;
	int currentState, lastState;
	int offset = 0;
	
	lastState = digitalRead(pin);
	
	fprintf(stderr, "Scanning begin\n");
	
	while(1) {
		currentTime = current();
		if (offset && currentTime > buffer[offset - 1] + wait) {
			break;
		}
		
		currentState = digitalRead(pin);
		if (currentState != lastState) {
			buffer[offset++] = currentTime;
			lastState = currentState;
		}
	}
	
	fprintf(stderr, "Scanning end\n");
	
	//buffer[offset] = buffer[offset - 1];
	//offset++;
	
	fprintf(stderr, "Output begin\n");
	
	int i;
	for (i = 1; i < offset; i++) {
		printf("%.0lf%s", buffer[i] - buffer[i - 1], (i & 1) ? "\t" : "\n");
	}
	
	fprintf(stderr, "Output end\n");
	
	return 0;
}
